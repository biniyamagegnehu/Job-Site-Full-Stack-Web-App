# API Testing Script for Job Portal Backend
$baseUrl = "http://localhost:8080/api"
$results = @()

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Job Portal API Testing" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -Method GET -UseBasicParsing
    $results += [PSCustomObject]@{Test="Health Check"; Status=$response.StatusCode; Result="PASS"}
    Write-Host "   PASS (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    $results += [PSCustomObject]@{Test="Health Check"; Status="ERROR"; Result="FAIL"}
    Write-Host "   FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Register Job Seeker
Write-Host "`n2. Testing Job Seeker Registration..." -ForegroundColor Yellow
$jobSeekerData = @{
    email = "test.jobseeker@example.com"
    username = "testjobseeker"
    password = "password123"
    firstName = "Test"
    lastName = "JobSeeker"
    phoneNumber = "+1234567890"
    role = "ROLE_JOB_SEEKER"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/register" -Method POST -Body $jobSeekerData -ContentType "application/json" -UseBasicParsing
    $responseObj = $response.Content | ConvertFrom-Json
    $jobSeekerToken = $responseObj.data.user.accessToken
    $results += [PSCustomObject]@{Test="Job Seeker Registration"; Status=$response.StatusCode; Result="PASS"}
    Write-Host "   PASS (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    $results += [PSCustomObject]@{Test="Job Seeker Registration"; Status="ERROR"; Result="FAIL"}
    Write-Host "   FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $jobSeekerToken = $null
}

# Test 3: Register Employer
Write-Host "`n3. Testing Employer Registration..." -ForegroundColor Yellow
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

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/register" -Method POST -Body $employerData -ContentType "application/json" -UseBasicParsing
    $responseObj = $response.Content | ConvertFrom-Json
    $employerToken = $responseObj.data.user.accessToken
    $results += [PSCustomObject]@{Test="Employer Registration"; Status=$response.StatusCode; Result="PASS"}
    Write-Host "   PASS (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    $results += [PSCustomObject]@{Test="Employer Registration"; Status="ERROR"; Result="FAIL"}
    Write-Host "   FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $employerToken = $null
}

# Test 4: Login
Write-Host "`n4. Testing Login..." -ForegroundColor Yellow
$loginData = @{
    email = "test.jobseeker@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json" -UseBasicParsing
    $responseObj = $response.Content | ConvertFrom-Json
    $loginToken = $responseObj.data.user.accessToken
    $results += [PSCustomObject]@{Test="Login"; Status=$response.StatusCode; Result="PASS"}
    Write-Host "   PASS (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    $results += [PSCustomObject]@{Test="Login"; Status="ERROR"; Result="FAIL"}
    Write-Host "   FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $loginToken = $null
}

# Test 5: Get All Jobs (Public)
Write-Host "`n5. Testing Get All Jobs (Public)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/jobs?page=0&size=10" -Method GET -UseBasicParsing
    $results += [PSCustomObject]@{Test="Get All Jobs"; Status=$response.StatusCode; Result="PASS"}
    Write-Host "   PASS (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    $results += [PSCustomObject]@{Test="Get All Jobs"; Status="ERROR"; Result="FAIL"}
    Write-Host "   FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Get Profile (Job Seeker)
Write-Host "`n6. Testing Get Profile (Job Seeker)..." -ForegroundColor Yellow
if ($loginToken) {
    $headers = @{
        "Authorization" = "Bearer $loginToken"
    }
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/job-seekers/profile" -Method GET -Headers $headers -UseBasicParsing
        $results += [PSCustomObject]@{Test="Get Profile"; Status=$response.StatusCode; Result="PASS"}
        Write-Host "   PASS (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        $results += [PSCustomObject]@{Test="Get Profile"; Status="ERROR"; Result="FAIL"}
        Write-Host "   FAIL - $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    $results += [PSCustomObject]@{Test="Get Profile"; Status="SKIP"; Result="SKIP - No token"}
    Write-Host "   SKIP (No token)" -ForegroundColor Gray
}

# Test 7: Admin Login
Write-Host "`n7. Testing Admin Login..." -ForegroundColor Yellow
$adminLoginData = @{
    email = "admin@jobportal.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Body $adminLoginData -ContentType "application/json" -UseBasicParsing
    $responseObj = $response.Content | ConvertFrom-Json
    $adminToken = $responseObj.data.user.accessToken
    $results += [PSCustomObject]@{Test="Admin Login"; Status=$response.StatusCode; Result="PASS"}
    Write-Host "   PASS (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    $results += [PSCustomObject]@{Test="Admin Login"; Status="ERROR"; Result="FAIL"}
    Write-Host "   FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $adminToken = $null
}

# Test 8: Admin Dashboard
Write-Host "`n8. Testing Admin Dashboard..." -ForegroundColor Yellow
if ($adminToken) {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/admin/dashboard" -Method GET -Headers $headers -UseBasicParsing
        $results += [PSCustomObject]@{Test="Admin Dashboard"; Status=$response.StatusCode; Result="PASS"}
        Write-Host "   PASS (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        $results += [PSCustomObject]@{Test="Admin Dashboard"; Status="ERROR"; Result="FAIL"}
        Write-Host "   FAIL - $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    $results += [PSCustomObject]@{Test="Admin Dashboard"; Status="SKIP"; Result="SKIP - No admin token"}
    Write-Host "   SKIP (No admin token)" -ForegroundColor Gray
}

# Summary
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
$passed = ($results | Where-Object { $_.Result -eq "PASS" }).Count
$failed = ($results | Where-Object { $_.Result -eq "FAIL" }).Count
$skipped = ($results | Where-Object { $_.Result -eq "SKIP" }).Count
$total = $results.Count

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host "Skipped: $skipped" -ForegroundColor Gray
Write-Host ""

$results | Format-Table -AutoSize
