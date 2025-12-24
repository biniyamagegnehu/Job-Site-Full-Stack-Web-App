# Comprehensive API Testing Script
$baseUrl = "http://localhost:8080/api"
$results = @()

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Comprehensive Job Portal API Testing" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Helper function to test endpoint
function Test-Endpoint {
    param($Name, $Method, $Uri, $Headers, $Body, $ExpectedStatus = 200)
    Write-Host "$Name..." -ForegroundColor Yellow -NoNewline
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            UseBasicParsing = $true
        }
        if ($Headers) { $params.Headers = $Headers }
        if ($Body) { 
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        $response = Invoke-WebRequest @params
        if ($response.StatusCode -eq $ExpectedStatus) {
            $results += [PSCustomObject]@{Test=$Name; Status=$response.StatusCode; Result="PASS"}
            Write-Host " PASS ($($response.StatusCode))" -ForegroundColor Green
            return $response
        } else {
            $results += [PSCustomObject]@{Test=$Name; Status=$response.StatusCode; Result="FAIL - Expected $ExpectedStatus"}
            Write-Host " FAIL (Got $($response.StatusCode), Expected $ExpectedStatus)" -ForegroundColor Red
            return $null
        }
    } catch {
        $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode.value__ } else { "ERROR" }
        $results += [PSCustomObject]@{Test=$Name; Status=$status; Result="FAIL"}
        Write-Host " FAIL - $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# 1. Health Check
Test-Endpoint "Health Check" GET "http://localhost:8080/health"

# 2. Register Job Seeker
$jobSeekerData = @{
    email = "test.jobseeker@example.com"
    username = "testjobseeker"
    password = "password123"
    firstName = "Test"
    lastName = "JobSeeker"
    phoneNumber = "+1234567890"
    role = "ROLE_JOB_SEEKER"
} | ConvertTo-Json
$response = Test-Endpoint "Job Seeker Registration" POST "$baseUrl/auth/register" $null $jobSeekerData 201
$jobSeekerToken = if ($response) { ($response.Content | ConvertFrom-Json).data.user.accessToken } else { $null }

# 3. Register Employer
$employerData = @{
    email = "test.employer@example.com"
    username = "testemployer"
    password = "password123"
    firstName = "Test"
    lastName = "Employer"
    phoneNumber = "+1234567890"
    role = "ROLE_EMPLOYER"
    companyName = "Test Company Inc"
    companyDescription = "A test company"
    companyWebsite = "https://testcompany.com"
    industry = "Technology"
    companySize = "50-100"
} | ConvertTo-Json
$response = Test-Endpoint "Employer Registration" POST "$baseUrl/auth/register" $null $employerData 201
$employerToken = if ($response) { ($response.Content | ConvertFrom-Json).data.user.accessToken } else { $null }

# 4. Login Job Seeker
$loginData = @{
    email = "test.jobseeker@example.com"
    password = "password123"
} | ConvertTo-Json
$response = Test-Endpoint "Job Seeker Login" POST "$baseUrl/auth/login" $null $loginData
$loginToken = if ($response) { ($response.Content | ConvertFrom-Json).data.user.accessToken } else { $null }

# 5. Get All Jobs (Public)
Test-Endpoint "Get All Jobs (Public)" GET "$baseUrl/jobs?page=0&size=10"

# 6. Search Jobs (Public)
Test-Endpoint "Search Jobs (Public)" GET "$baseUrl/jobs/search?title=engineer&page=0&size=10"

# 7. Get Profile (Job Seeker)
if ($loginToken) {
    $headers = @{"Authorization" = "Bearer $loginToken"}
    Test-Endpoint "Get Profile (Job Seeker)" GET "$baseUrl/job-seekers/profile" $headers
}

# 8. Update Profile (Job Seeker)
if ($loginToken) {
    $profileData = @{
        firstName = "Updated"
        lastName = "Name"
        profileHeadline = "Experienced Developer"
    } | ConvertTo-Json
    $headers = @{"Authorization" = "Bearer $loginToken"}
    Test-Endpoint "Update Profile (Job Seeker)" PUT "$baseUrl/job-seekers/profile" $headers $profileData
}

# 9. Admin Login
$adminLoginData = @{
    email = "admin@jobportal.com"
    password = "admin123"
} | ConvertTo-Json
$response = Test-Endpoint "Admin Login" POST "$baseUrl/auth/login" $null $adminLoginData
$adminToken = if ($response) { ($response.Content | ConvertFrom-Json).data.user.accessToken } else { $null }

# 10. Admin Dashboard
if ($adminToken) {
    $headers = @{"Authorization" = "Bearer $adminToken"}
    Test-Endpoint "Admin Dashboard" GET "$baseUrl/admin/dashboard" $headers
}

# 11. Admin Get All Users
if ($adminToken) {
    $headers = @{"Authorization" = "Bearer $adminToken"}
    Test-Endpoint "Admin Get All Users" GET "$baseUrl/admin/users?page=0&size=10" $headers
}

# 12. Admin Get Pending Employers
if ($adminToken) {
    $headers = @{"Authorization" = "Bearer $adminToken"}
    Test-Endpoint "Admin Get Pending Employers" GET "$baseUrl/admin/employers/pending" $headers
}

# 13. Admin Approve Employer
if ($adminToken -and $employerToken) {
    # Get employer ID from token or registration
    $headers = @{"Authorization" = "Bearer $adminToken"}
    # This would need the employer ID - skipping for now
    Write-Host "Admin Approve Employer..." -ForegroundColor Yellow -NoNewline
    Write-Host " SKIP (Need employer ID)" -ForegroundColor Gray
    $results += [PSCustomObject]@{Test="Admin Approve Employer"; Status="SKIP"; Result="SKIP - Need employer ID"}
}

# Summary
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
$passed = ($results | Where-Object { $_.Result -eq "PASS" }).Count
$failed = ($results | Where-Object { $_.Result -like "FAIL*" }).Count
$skipped = ($results | Where-Object { $_.Result -eq "SKIP*" }).Count
$total = $results.Count

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host "Skipped: $skipped" -ForegroundColor Gray
Write-Host ""

$results | Format-Table -AutoSize


