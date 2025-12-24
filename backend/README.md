# Job Portal Backend

A production-ready job portal backend built with Spring Boot, Spring Security, and PostgreSQL.

## Features
- JWT-based authentication
- Role-based authorization (Job Seeker, Employer, Admin)
- Job posting and application system
- CV upload and management
- Admin approval workflow for employers
- RESTful APIs with Swagger documentation

## Tech Stack
- Java 17
- Spring Boot 3.1.5
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL
- Maven
- Docker

## Setup Instructions

### Prerequisites
- Java 17+
- Maven 3.6+
- PostgreSQL 14+
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd job-portal-backend
```

### Local development (H2 database)

For quick local development the project can use an embedded H2 database. By default the project is configured to use a file-based H2 database (stored in `backend/data`) so data persists between restarts. To use the in-memory mode instead, edit `src/main/resources/application.properties` and set:

```
spring.datasource.url=jdbc:h2:mem:jobportal;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
```

H2 console is available at `/h2-console` when running locally.
