# Leave Expansion — Postman Testing Guide

**Base URL:** `http://localhost:3000/api/v1`
**Prerequisites:**
1. Run migrations: `npm run db:migrate`
2. Set `FEATURE_NEW_LEAVES=true` in `.env`
3. Restart the server: `npm run dev`

---

## 0. Setup — Get Auth Token

```
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "your_email@example.com",
  "password": "your_password"
}
```

Copy the `accessToken` from the response. Set it as a Postman variable or use in headers:

```
Authorization: Bearer {{accessToken}}
```

---

## 1. Verify New Vacation Types

### 1.1 List All Vacation Types

```
GET {{baseUrl}}/vacation-types
Authorization: Bearer {{accessToken}}
```

**Expected:** Response should include the 5 new types with new fields:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Annual Leave",
      "default_days": 30,
      "unit": "day",
      "balance_managed": true,
      "requires_attachment": false,
      "default_paid_percent": 100,
      "policy_code": null
    },
    {
      "id": 4,
      "name": "Maternity Leave",
      "default_days": 0,
      "unit": "day",
      "balance_managed": false,
      "requires_attachment": true,
      "default_paid_percent": 100,
      "policy_code": "maternity"
    },
    {
      "id": 7,
      "name": "Emergency Leave",
      "default_days": 0,
      "unit": "hour",
      "balance_managed": false,
      "requires_attachment": false,
      "default_paid_percent": 100,
      "policy_code": "emergency_hour"
    }
  ]
}
```

> **Note:** The exact `id` values depend on your existing data. Note the IDs of the new types for subsequent tests.

---

## 2. Maternity Leave (Day-Based, Calendar Days)

### 2.1 Submit Maternity Leave

> **Requirement:** Employee must be female (`gender = 'Female'`).

```
POST {{baseUrl}}/requests/vacations
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "vacation_type_id": {{maternity_type_id}},
  "start_date": "2026-03-01",
  "end_date": "2026-05-29",
  "reason": "Maternity leave",
  "request_context": {
    "expected_delivery_date": "2026-03-15"
  }
}
```

**Expected:** `201 Created`
```json
{
  "message": "Vacation request submitted successfully",
  "data": {
    "id": 123,
    "vacation_type": {
      "id": 4,
      "name": "Maternity Leave",
      "policy_code": "maternity"
    },
    "start_date": "2026-03-01",
    "end_date": "2026-05-29",
    "days_requested": 90,
    "status": "Pending"
  }
}
```

**Error cases to test:**
- Male employee → `400 "Maternity leave is only available for female employees"`
- Duration > 90 calendar days → `400 "Maternity leave cannot exceed 90 calendar days"`

### 2.2 Approve Maternity Leave

```
POST {{baseUrl}}/requests/vacations/{{vacation_id}}/approve
Authorization: Bearer {{approver_token}}
Content-Type: application/json

{
  "comments": "Approved"
}
```

**Expected:** `200 OK` — Creates timeline segments with pay bands:
- Days 1–45: `paid_percent: 100`
- Days 46–90: `paid_percent: 50`

---

## 3. Bereavement Leave (Day-Based)

### 3.1 Submit Bereavement Leave

```
POST {{baseUrl}}/requests/vacations
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "vacation_type_id": {{bereavement_type_id}},
  "start_date": "2026-03-01",
  "end_date": "2026-03-05",
  "reason": "Family bereavement",
  "request_context": {
    "relationship_type": "spouse"
  }
}
```

**Expected:** `201 Created` with `days_requested` matching working days in range.

**Error cases to test:**
- Missing `relationship_type` → `400 "Bereavement leave requires relationship_type in request_context"`
- Duration exceeds allowed days for relationship → `400` error (defaults: spouse=5, parent=5, child=5, sibling=3, grandparent=3, other=1)

### 3.2 Approve Bereavement Leave

Same flow as standard vacation approval:

```
POST {{baseUrl}}/requests/vacations/{{vacation_id}}/approve
Authorization: Bearer {{approver_token}}
Content-Type: application/json

{
  "comments": "Condolences, approved"
}
```

---

## 4. Unpaid Leave (Day-Based)

### 4.1 Submit Unpaid Leave

```
POST {{baseUrl}}/requests/vacations
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "vacation_type_id": {{unpaid_day_type_id}},
  "start_date": "2026-04-01",
  "end_date": "2026-04-03",
  "reason": "Personal matters"
}
```

**Expected:** `201 Created`. No balance deduction (balance_managed=false).

### 4.2 Approve Unpaid Leave

```
POST {{baseUrl}}/requests/vacations/{{vacation_id}}/approve
Authorization: Bearer {{approver_token}}
Content-Type: application/json

{
  "comments": "Approved"
}
```

**Expected:** Creates timeline with `Unpaid` segment type and `metadata.policy_code = 'unpaid_day'`. Payroll will generate a full deduction for these days.

---

## 5. Emergency Hour Leave

### 5.1 Submit Emergency Hour Leave

```
POST {{baseUrl}}/requests/hour-leaves
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "vacation_type_id": {{emergency_hour_type_id}},
  "request_date": "2026-03-10",
  "start_time": "09:00",
  "end_time": "11:00",
  "reason": "Doctor appointment"
}
```

**Expected:** `201 Created`
```json
{
  "message": "Hour leave request submitted successfully",
  "data": {
    "id": 456,
    "vacation_type": {
      "id": 7,
      "name": "Emergency Leave",
      "policy_code": "emergency_hour"
    },
    "request_date": "2026-03-10",
    "start_time": "09:00:00",
    "end_time": "11:00:00",
    "requested_minutes": 120,
    "is_paid": true,
    "status": "Pending"
  }
}
```

**Error cases to test:**
- `start_time >= end_time` → `400` validation error
- Duration > 120 minutes (default max) → `400 "Emergency hour leave cannot exceed 120 minutes per request"`
- Overlapping time range with existing request on same date → `409 "You already have an hour leave request overlapping this time"`
- `is_paid` will be `false` if employee has 0 Annual leave balance

### 5.2 Edit Pending Hour Leave

```
PUT {{baseUrl}}/requests/hour-leaves/{{vacation_id}}
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "start_time": "10:00",
  "end_time": "11:30"
}
```

**Expected:** `200 OK` with updated times.

### 5.3 Approve Hour Leave

```
POST {{baseUrl}}/requests/hour-leaves/{{vacation_id}}/approve
Authorization: Bearer {{approver_token}}
Content-Type: application/json

{
  "comments": "Approved"
}
```

**Expected:** `200 OK`. This will:
1. Append a `Leave` (or `Unpaid`) segment to the day's timeline
2. Process emergency conversion: accumulates minutes in `LeaveHourCounters`
3. If total reaches 480 minutes → deducts 1 Annual leave day automatically

### 5.4 Admin Submit Hour Leave (on behalf)

```
POST {{baseUrl}}/employees/{{employee_id}}/hour-leaves
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "vacation_type_id": {{emergency_hour_type_id}},
  "request_date": "2026-03-12",
  "start_time": "14:00",
  "end_time": "15:30",
  "reason": "Emergency",
  "auto_approve": true
}
```

**Expected:** `201 Created` with `status: "Approved"` (if `auto_approve: true`). Timeline segment created immediately.

### 5.5 Reject Hour Leave

```
POST {{baseUrl}}/requests/hour-leaves/{{vacation_id}}/reject
Authorization: Bearer {{approver_token}}
Content-Type: application/json

{
  "rejection_reason": "Insufficient justification"
}
```

### 5.6 Cancel Hour Leave

```
POST {{baseUrl}}/requests/hour-leaves/{{vacation_id}}/cancel
Authorization: Bearer {{accessToken}}
```

---

## 6. Nursing Hour (Policy-Based)

### 6.1 Submit Nursing Request

> **Requirement:** Employee must be female.

```
POST {{baseUrl}}/requests/nursing
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "vacation_type_id": {{nursing_type_id}},
  "reason": "Nursing hour request"
}
```

**Expected:** `201 Created`
```json
{
  "message": "Nursing request submitted successfully",
  "data": {
    "id": 789,
    "vacation_type": {
      "id": 8,
      "name": "Nursing Hour",
      "policy_code": "nursing"
    },
    "request_unit": "policy",
    "status": "Pending"
  }
}
```

**Error cases to test:**
- Male employee → `400 "Nursing hour is only available for female employees"`
- Already has an active (Approved) nursing request → `409 "Employee already has an active nursing request"`

### 6.2 Approve Nursing Request

```
POST {{baseUrl}}/requests/nursing/{{vacation_id}}/approve
Authorization: Bearer {{approver_token}}
Content-Type: application/json

{
  "comments": "Approved"
}
```

**Expected:** `200 OK` with `approval_context` containing `nursing_end_date` (2 years from approval).

**Effect on payroll:** For each payroll period while nursing is active, `scheduledWorkingMinutes` is reduced by 60 minutes per working day. This means the employee effectively works 1 hour less per day without any salary deduction.

### 6.3 Reject / Cancel Nursing

```
POST {{baseUrl}}/requests/nursing/{{vacation_id}}/reject
Authorization: Bearer {{approver_token}}
Content-Type: application/json

{
  "rejection_reason": "Documentation required"
}
```

```
POST {{baseUrl}}/requests/nursing/{{vacation_id}}/cancel
Authorization: Bearer {{accessToken}}
```

---

## 7. Verify Enhanced Existing Endpoints

### 7.1 Vacation List — New Fields

```
GET {{baseUrl}}/requests/vacations
Authorization: Bearer {{accessToken}}
```

**Verify:** Each item now includes `request_unit`, `request_date`, `start_time`, `end_time`, `requested_minutes`, `calendar_days_requested`.

### 7.2 Vacation Detail — New Fields

```
GET {{baseUrl}}/requests/vacations/{{vacation_id}}
Authorization: Bearer {{accessToken}}
```

**Verify:** Response includes `request_context`, `approval_context` for new leave types.

### 7.3 Time-Off Summary — New Sections

```
GET {{baseUrl}}/employees/{{employee_id}}/time-off/summary
Authorization: Bearer {{accessToken}}
```

**Expected:** Response now includes:
```json
{
  "balances": [...],
  "requests": [...],
  "hour_counters": [
    {
      "vacation_type_id": 7,
      "year": 2026,
      "total_minutes": 240,
      "converted_days": 0,
      "remainder_minutes": 240
    }
  ],
  "nursing_status": {
    "active": true,
    "approved_at": "2026-03-01T10:00:00.000Z",
    "nursing_end_date": "2028-03-01"
  }
}
```

---

## 8. Attendance Conflict — Backward Compatibility

### 8.1 Hour Leave Does NOT Block Check-In

1. Submit and approve an hour leave for date X
2. Submit attendance check-in for date X

```
POST {{baseUrl}}/requests/attendance
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "log_date": "2026-03-10",
  "check_in_time": "08:00"
}
```

**Expected:** `201 Created` — Hour leaves should NOT block attendance.

### 8.2 Day Leave Still Blocks Check-In

1. Submit and approve a day-based vacation for date Y
2. Try to submit attendance for date Y

**Expected:** `409 "Cannot submit attendance request while you have a vacation on this date"`

---

## 9. Feature Flag Verification

### 9.1 When Disabled

Set `FEATURE_NEW_LEAVES=false` (or remove the env var), restart the server.

```
POST {{baseUrl}}/requests/hour-leaves
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "vacation_type_id": 7,
  "request_date": "2026-03-10",
  "start_time": "09:00",
  "end_time": "11:00"
}
```

**Expected:** `404 Not Found` (route unavailable when feature flag is off).

> **Note:** Standard vacation submit (`POST /requests/vacations`) still works for maternity/bereavement/unpaid since the feature flag only gates the new route files. The `submitVacation` service handles new types regardless of flag state.

---

## Postman Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `{{baseUrl}}` | API base URL | `http://localhost:3000/api/v1` |
| `{{accessToken}}` | JWT access token | From login response |
| `{{approver_token}}` | Token for user with `approve_vacation` permission | — |
| `{{admin_token}}` | Token for user with `manage_vacation_requests` permission | — |
| `{{employee_id}}` | Target employee ID (for admin routes) | `42` |
| `{{maternity_type_id}}` | VacationType ID for Maternity Leave | From `/vacation-types` |
| `{{bereavement_type_id}}` | VacationType ID for Bereavement Leave | From `/vacation-types` |
| `{{unpaid_day_type_id}}` | VacationType ID for Unpaid Leave | From `/vacation-types` |
| `{{emergency_hour_type_id}}` | VacationType ID for Emergency Leave | From `/vacation-types` |
| `{{nursing_type_id}}` | VacationType ID for Nursing Hour | From `/vacation-types` |
| `{{vacation_id}}` | ID of a created vacation request | From submit response |

---

## Testing Order (Recommended)

1. **Setup:** Login → get token → list vacation types → note IDs
2. **Hour Leave flow:** Submit → Edit → Approve → verify timeline → check time-off summary
3. **Maternity flow:** Submit (female employee) → Approve → verify timeline segments have pay bands
4. **Bereavement flow:** Submit with relationship → Approve → verify timeline
5. **Unpaid flow:** Submit → Approve → verify Unpaid segment on timeline
6. **Nursing flow:** Submit (female employee) → Approve → verify scheduled minutes reduction in payroll
7. **Attendance conflict:** Verify hour leave doesn't block check-in; day leave still blocks
8. **Feature flag:** Disable → verify 404 on new routes → re-enable
9. **Admin flow:** Admin submit hour leave with `auto_approve: true`
10. **Error cases:** Wrong gender, exceeded duration, overlapping times, etc.
