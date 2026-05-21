const express = require("express");
const { body, validationResult } = require("express-validator");
const supabase = require("../lib/supabase");
const { requireAuth } = require("../middleware/auth");
const { requireLevel, injectSchool } = require("../middleware/rbac");

const router = express.Router();
router.use(requireAuth, injectSchool);

// GET /students
router.get("/", requireLevel(40), async (req, res) => {
  const { status, programType, classId, q, page = 1, limit = 50 } = req.query;
  let query = supabase
    .from("students")
    .select("*, classes(id,name,age_group,color), student_parents(is_primary,relation,parents(id,first_name,last_name,phone,whatsapp,email))", { count: "exact" })
    .eq("school_id", req.schoolId)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status)      query = query.eq("status", status);
  if (programType) query = query.eq("program_type", programType);
  if (classId)     query = query.eq("class_id", classId);
  if (q)           query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,admission_no.ilike.%${q}%`);

  const { data, count, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ total: count || 0, page: parseInt(page), students: data || [] });
});

// GET /students/:id
router.get("/:id", requireLevel(40), async (req, res) => {
  const { data, error } = await supabase
    .from("students")
    .select("*, classes(*), student_parents(*, parents(*)), enrollments(*, academic_years(*)), attendance(* ORDER BY date DESC LIMIT 30), progress_records(* ORDER BY observed_at DESC LIMIT 20)")
    .eq("id", req.params.id)
    .eq("school_id", req.schoolId)
    .single();
  if (error) return res.status(404).json({ error: "Student not found" });
  res.json(data);
});

// POST /students
router.post("/",
  requireLevel(60),
  body("firstName").trim().notEmpty(),
  body("lastName").trim().notEmpty(),
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

    const { firstName, lastName, dateOfBirth, gender, programType, classId,
            status, admissionNo, allergies, medicalNotes, emergencyContact,
            notes, parentData } = req.body;

    const { data: student, error } = await supabase.from("students").insert({
      school_id: req.schoolId,
      first_name: firstName, last_name: lastName,
      ...(dateOfBirth   && { date_of_birth: dateOfBirth }),
      ...(gender        && { gender }),
      ...(programType   && { program_type: programType }),
      ...(classId       && { class_id: classId }),
      status: status || "ACTIVE",
      ...(admissionNo   && { admission_no: admissionNo }),
      allergies: allergies || [],
      ...(medicalNotes    && { medical_notes: medicalNotes }),
      ...(emergencyContact && { emergency_contact: emergencyContact }),
      ...(notes         && { notes }),
      enrolled_at: new Date().toISOString(),
    }).select().single();

    if (error) return res.status(500).json({ error: error.message });

    // Optionally create parent
    if (parentData?.firstName) {
      const { data: parent } = await supabase.from("parents").insert({
        school_id: req.schoolId,
        first_name: parentData.firstName,
        last_name: parentData.lastName || "",
        email: parentData.email || null,
        phone: parentData.phone || null,
        whatsapp: parentData.whatsapp || null,
      }).select().single();
      if (parent) {
        await supabase.from("student_parents").insert({
          student_id: student.id, parent_id: parent.id,
          relation: parentData.relation || "mother", is_primary: true,
        });
      }
    }

    const { data: full } = await supabase
      .from("students")
      .select("*, classes(*), student_parents(*, parents(*))")
      .eq("id", student.id).single();
    res.status(201).json(full || student);
  }
);

// PUT /students/:id
router.put("/:id", requireLevel(60), async (req, res) => {
  const { data: existing } = await supabase.from("students").select("id").eq("id", req.params.id).eq("school_id", req.schoolId).limit(1);
  if (!existing?.length) return res.status(404).json({ error: "Student not found" });

  const map = {
    firstName:"first_name", lastName:"last_name", dateOfBirth:"date_of_birth",
    gender:"gender", programType:"program_type", classId:"class_id",
    status:"status", admissionNo:"admission_no", allergies:"allergies",
    medicalNotes:"medical_notes", emergencyContact:"emergency_contact", notes:"notes",
  };
  const patch = {};
  Object.entries(map).forEach(([js, db]) => {
    if (req.body[js] !== undefined) patch[db] = req.body[js] === "" ? null : req.body[js];
  });
  patch.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from("students").update(patch).eq("id", req.params.id)
    .select("*, classes(*), student_parents(*, parents(*))").single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /students/:id
router.delete("/:id", requireLevel(80), async (req, res) => {
  const { data: existing } = await supabase.from("students").select("id").eq("id", req.params.id).eq("school_id", req.schoolId).limit(1);
  if (!existing?.length) return res.status(404).json({ error: "Student not found" });
  await supabase.from("students").delete().eq("id", req.params.id);
  res.json({ ok: true });
});

module.exports = router;
