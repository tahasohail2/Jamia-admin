# Student Records Migration Schema

## How It Works

1. I send you batch student records via API
2. You validate each record based on `approvalStatus` + `registrationNo`
3. You store them in the new DB

---

## API Endpoint

**POST** `/api/migrate/batch`

```json
{
  "batchId": "batch_001",
  "records": [ ...array of student records... ]
}
```

---

## Single Record Structure

```json
{
  "id": 1,
  "submittedAt": "2026-03-15T10:30:00.000Z",
  "admissionType": "new",
  "gender": "male",
  "department": "Computer Science",
  "studentName": "Ahmed Khan",
  "fatherName": "Imran Khan",
  "dob": "2005-06-15",
  "cnic": "35201-1234567-1",
  "phone": "0300-1234567",
  "whatsapp": "0300-1234567",
  "fullAddress": "Permanent address here",
  "currentAddress": "Current address here",
  "requiredGrade": "1st Year",
  "previousEducation": "Matric",
  "educationType": "Science",
  "registrationNo": "REG-2026-001",
  "lastYearGrade": "A",
  "nextYearGrade": "1st Year",
  "certificateUrls": ["https://cloudinary.com/cert1.pdf"],
  "cnicUrls": ["https://cloudinary.com/cnic_front.jpg"],
  "additionalUrls": [],
  "examPart1Marks": "450",
  "examPart2Marks": "480",
  "totalMarks": "930",
  "remarks": "",
  "approvalStatus": "approved",
  "approvedBy": 1,
  "approvedAt": "2026-03-20T14:00:00.000Z"
}
```

---

## Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| id | integer | yes | Original record ID |
| submittedAt | datetime | yes | ISO 8601 |
| admissionType | string | yes | "new" or "continuing" |
| gender | string | yes | |
| department | string | yes | |
| studentName | string | yes | Max 200 |
| fatherName | string | no | Max 200 |
| dob | string | yes | YYYY-MM-DD |
| cnic | string | yes | Format: XXXXX-XXXXXXX-X (unique) |
| phone | string | yes | Digits and hyphens |
| whatsapp | string | no | Digits and hyphens |
| fullAddress | string | no | |
| currentAddress | string | yes | |
| requiredGrade | string | no | |
| previousEducation | string | no | |
| educationType | string | no | "Science", "Arts", etc. |
| registrationNo | string | no | Board registration number |
| lastYearGrade | string | no | |
| nextYearGrade | string | no | |
| certificateUrls | string[] | no | Cloudinary URLs |
| cnicUrls | string[] | no | Cloudinary URLs |
| additionalUrls | string[] | no | Cloudinary URLs |
| examPart1Marks | string | no | Numeric string |
| examPart2Marks | string | no | Numeric string |
| totalMarks | string | no | Numeric string |
| remarks | string | no | |
| approvalStatus | string | no | `"approved"`, `"disapproved"`, or `null` (pending) |
| approvedBy | integer | no | Admin user ID |
| approvedAt | datetime | no | ISO 8601 |

---

## Status Validation Logic

| approvalStatus | registrationNo | What To Do |
|---|---|---|
| `"approved"` | Has value | ✅ Store in **passed/approved** records |
| `"approved"` | Empty/missing | ❌ Reject — approved must have registrationNo |
| `"disapproved"` | Any | Store in **failed/disapproved** records |
| `null` (pending) | Any | Store in **pending** records |

---

## Expected Response

```json
{
  "batchId": "batch_001",
  "total": 50,
  "successful": 48,
  "failed": 2,
  "results": [
    { "id": 1, "status": "success", "routedTo": "approved" },
    { "id": 2, "status": "failed", "error": "Approved record missing registrationNo" }
  ]
}
```

---

## New DB Schema

```sql
CREATE TABLE student_records (
    id SERIAL PRIMARY KEY,
    original_id INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    admission_type VARCHAR(50) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    department VARCHAR(100) NOT NULL,
    student_name VARCHAR(200) NOT NULL,
    father_name VARCHAR(200),
    dob DATE NOT NULL,
    cnic VARCHAR(15) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    full_address TEXT,
    current_address TEXT NOT NULL,
    required_grade VARCHAR(50),
    previous_education VARCHAR(200),
    education_type VARCHAR(100),
    registration_no VARCHAR(100),
    last_year_grade VARCHAR(50),
    next_year_grade VARCHAR(50),
    certificate_urls TEXT[],
    cnic_urls TEXT[],
    additional_urls TEXT[],
    exam_part1_marks VARCHAR(10),
    exam_part2_marks VARCHAR(10),
    total_marks VARCHAR(10),
    remarks TEXT,
    approval_status VARCHAR(20) CHECK (approval_status IN ('approved', 'disapproved')),
    approved_by INTEGER,
    approved_at TIMESTAMP WITH TIME ZONE,
    migrated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    batch_id VARCHAR(100)
);

CREATE INDEX idx_cnic ON student_records(cnic);
CREATE INDEX idx_registration_no ON student_records(registration_no);
CREATE INDEX idx_approval_status ON student_records(approval_status);
CREATE INDEX idx_batch_id ON student_records(batch_id);
```
