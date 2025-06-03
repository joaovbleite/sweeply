# Sweeply - Data Structure

## Database Schema

### Users and Authentication

#### users
- `id`: UUID (PK)
- `email`: String
- `phone`: String
- `full_name`: String
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `last_sign_in`: Timestamp
- `avatar_url`: String
- `is_active`: Boolean

#### user_profiles
- `id`: UUID (PK)
- `user_id`: UUID (FK -> users.id)
- `company_id`: UUID (FK -> companies.id)
- `role`: String (enum: 'owner', 'admin', 'manager', 'staff', 'client')
- `job_title`: String
- `bio`: String
- `preferences`: JSON
- `theme`: String
- `language`: String
- `timezone`: String
- `notification_settings`: JSON
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### companies
- `id`: UUID (PK)
- `name`: String
- `logo_url`: String
- `website`: String
- `primary_contact_id`: UUID (FK -> users.id)
- `phone`: String
- `email`: String
- `address`: String
- `city`: String
- `state`: String
- `postal_code`: String
- `country`: String
- `tax_id`: String
- `business_type`: String
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `subscription_tier`: String
- `subscription_status`: String
- `settings`: JSON

### Client Management

#### clients
- `id`: UUID (PK)
- `company_id`: UUID (FK -> companies.id)
- `name`: String
- `primary_contact_id`: UUID (FK -> users.id, nullable)
- `email`: String
- `phone`: String
- `address`: String
- `city`: String
- `state`: String
- `postal_code`: String
- `country`: String
- `notes`: Text
- `tags`: Array[String]
- `is_active`: Boolean
- `acquisition_source`: String
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### client_locations
- `id`: UUID (PK)
- `client_id`: UUID (FK -> clients.id)
- `name`: String
- `address`: String
- `city`: String
- `state`: String
- `postal_code`: String
- `country`: String
- `primary_contact_name`: String
- `primary_contact_phone`: String
- `primary_contact_email`: String
- `access_instructions`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Job Management

#### service_types
- `id`: UUID (PK)
- `company_id`: UUID (FK -> companies.id)
- `name`: String
- `description`: Text
- `default_price`: Decimal
- `default_duration`: Integer (minutes)
- `color_code`: String
- `is_active`: Boolean
- `checklist_items`: Array[String]
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### jobs
- `id`: UUID (PK)
- `company_id`: UUID (FK -> companies.id)
- `client_id`: UUID (FK -> clients.id)
- `location_id`: UUID (FK -> client_locations.id)
- `service_type_id`: UUID (FK -> service_types.id)
- `title`: String
- `description`: Text
- `status`: String (enum: 'scheduled', 'in_progress', 'completed', 'cancelled')
- `scheduled_date`: Timestamp
- `scheduled_end_date`: Timestamp
- `estimated_duration`: Integer (minutes)
- `price_quoted`: Decimal
- `is_recurring`: Boolean
- `recurring_pattern_id`: UUID (FK -> recurring_patterns.id, nullable)
- `assigned_to`: Array[UUID] (FK -> users.id)
- `notes`: Text
- `created_by`: UUID (FK -> users.id)
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### recurring_patterns
- `id`: UUID (PK)
- `company_id`: UUID (FK -> companies.id)
- `frequency`: String (enum: 'daily', 'weekly', 'biweekly', 'monthly')
- `day_of_week`: Integer (0-6, for weekly)
- `day_of_month`: Integer (1-31, for monthly)
- `week_of_month`: Integer (for monthly)
- `start_date`: Date
- `end_date`: Date (nullable)
- `time_of_day`: Time
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### job_activities
- `id`: UUID (PK)
- `job_id`: UUID (FK -> jobs.id)
- `user_id`: UUID (FK -> users.id)
- `activity_type`: String (enum: 'check_in', 'check_out', 'note', 'photo', 'status_change')
- `status`: String (nullable)
- `note`: Text (nullable)
- `photo_url`: String (nullable)
- `location`: Point (nullable)
- `timestamp`: Timestamp
- `created_at`: Timestamp

### Financial Management

#### quotes
- `id`: UUID (PK)
- `company_id`: UUID (FK -> companies.id)
- `client_id`: UUID (FK -> clients.id)
- `service_type_id`: UUID (FK -> service_types.id)
- `title`: String
- `description`: Text
- `total_amount`: Decimal
- `status`: String (enum: 'draft', 'sent', 'accepted', 'rejected', 'expired')
- `valid_until`: Date
- `created_by`: UUID (FK -> users.id)
- `sent_at`: Timestamp
- `accepted_at`: Timestamp
- `rejected_at`: Timestamp
- `rejection_reason`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### invoices
- `id`: UUID (PK)
- `company_id`: UUID (FK -> companies.id)
- `client_id`: UUID (FK -> clients.id)
- `job_id`: UUID (FK -> jobs.id, nullable)
- `invoice_number`: String
- `issue_date`: Date
- `due_date`: Date
- `total_amount`: Decimal
- `tax_amount`: Decimal
- `status`: String (enum: 'draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled')
- `notes`: Text
- `created_by`: UUID (FK -> users.id)
- `sent_at`: Timestamp
- `paid_at`: Timestamp
- `payment_method`: String
- `payment_reference`: String
- `balance_due`: Decimal
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### invoice_items
- `id`: UUID (PK)
- `invoice_id`: UUID (FK -> invoices.id)
- `description`: String
- `quantity`: Decimal
- `unit_price`: Decimal
- `amount`: Decimal
- `tax_rate`: Decimal
- `tax_amount`: Decimal
- `created_at`: Timestamp

#### expenses
- `id`: UUID (PK)
- `company_id`: UUID (FK -> companies.id)
- `job_id`: UUID (FK -> jobs.id, nullable)
- `category`: String
- `amount`: Decimal
- `date`: Date
- `description`: Text
- `receipt_url`: String
- `created_by`: UUID (FK -> users.id)
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Core Relationships

1. **Companies to Users**: One-to-many (A company has multiple users)
2. **Companies to Clients**: One-to-many (A company has multiple clients)
3. **Clients to Locations**: One-to-many (A client can have multiple locations)
4. **Companies to Service Types**: One-to-many (A company defines multiple service types)
5. **Companies to Jobs**: One-to-many (A company manages multiple jobs)
6. **Clients to Jobs**: One-to-many (A client can have multiple jobs)
7. **Jobs to Users**: Many-to-many (A job can be assigned to multiple users)
8. **Jobs to Activities**: One-to-many (A job has multiple activities)
9. **Jobs to Invoices**: One-to-many (A job can have multiple invoices, though usually one)
10. **Invoices to Items**: One-to-many (An invoice contains multiple line items)
11. **Jobs to Recurring Patterns**: Many-to-one (Multiple jobs can follow the same pattern)

## Indexes

- Users: email, company_id
- Clients: company_id, name, email
- Jobs: company_id, client_id, scheduled_date, status
- Invoices: company_id, client_id, invoice_number, status, due_date
- Job Activities: job_id, timestamp
- Quotes: company_id, client_id, status

## Security Rules

1. Users can only access data for their own company
2. User access is restricted based on role:
   - Owners/Admins: Full access to all company data
   - Managers: Access to assigned teams and their jobs
   - Staff: Access only to assigned jobs
   - Clients: Access only to their own data
3. Sensitive data (financial, personal) has additional access restrictions
4. All data modifications are logged for audit purposes 