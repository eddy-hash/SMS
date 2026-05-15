import React, { useState } from "react";

export default function RegisterForm() {
  const [form, setForm] = useState({
    fname: "", lname: "", email: "", password: "", confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [strength, setStrength] = useState({ width: "0%", color: "", label: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "password") updateStrength(value);
  };

  const updateStrength = (v) => {
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    const map = [
      { width: "0%",   color: "",        label: "" },
      { width: "25%",  color: "#E24B4A", label: "Weak" },
      { width: "50%",  color: "#EF9F27", label: "Fair" },
      { width: "75%",  color: "#1D9E75", label: "Good" },
      { width: "100%", color: "#639922", label: "Strong" },
    ];
    setStrength(map[score]);
  };

  const validate = () => {
    const errs = {};
    if (!form.fname.trim()) errs.fname = "Required";
    if (!form.lname.trim()) errs.lname = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
    if (form.confirm !== form.password || !form.confirm) errs.confirm = "Passwords do not match";
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) setSuccess(true);
  };

  if (success) {
    return (
      <div style={styles.card}>
        <div style={styles.successBox}>
          <div style={styles.successIcon}>
            <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="#0F6E56" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p style={{ fontSize: 20, fontWeight: 500, margin: "0 0 8px" }}>Account created!</p>
          <p style={{ fontSize: 14, color: "#888", margin: 0 }}>Welcome aboard. You're all set.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Create an account</h2>
      <p style={styles.sub}>Sign up to get started today</p>

      <div style={styles.row}>
        <Field label="First name" name="fname" placeholder="Alice" value={form.fname} onChange={handleChange} error={errors.fname} />
        <Field label="Last name" name="lname" placeholder="Smith" value={form.lname} onChange={handleChange} error={errors.lname} />
      </div>

      <Field label="Email address" name="email" type="email" placeholder="alice@example.com" value={form.email} onChange={handleChange} error={errors.email} />

      <div style={styles.field}>
        <label style={styles.label}>Password</label>
        <input
          name="password"
          type="password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={handleChange}
          style={{ ...styles.input, borderColor: errors.password ? "#E24B4A" : "#ddd" }}
        />
        <div style={styles.strengthTrack}>
          <div style={{ ...styles.strengthFill, width: strength.width, background: strength.color }} />
        </div>
        {strength.label && <p style={{ ...styles.strengthLabel, color: strength.color }}>{strength.label}</p>}
        {errors.password && <p style={styles.error}>{errors.password}</p>}
      </div>

      <Field label="Confirm password" name="confirm" type="password" placeholder="Repeat your password" value={form.confirm} onChange={handleChange} error={errors.confirm} />

      <button onClick={handleSubmit} style={styles.submitBtn}>
        Create account
      </button>

      <p style={styles.loginLink}>
        Already have an account? <span style={styles.link}>Sign in</span>
      </p>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder, value, onChange, error }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{ ...styles.input, borderColor: error ? "#E24B4A" : "#ddd" }}
      />
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    border: "0.5px solid #e5e5e5",
    borderRadius: 12,
    padding: "2rem",
    maxWidth: 440,
    margin: "2rem auto",
    fontFamily: "sans-serif",
  },
  title: { fontSize: 22, fontWeight: 500, margin: "0 0 4px" },
  sub: { fontSize: 14, color: "#888", margin: "0 0 1.5rem" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  field: { marginBottom: "1rem" },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "#555", marginBottom: 6 },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 12px",
    fontSize: 14,
    border: "1px solid #ddd",
    borderRadius: 8,
    outline: "none",
    color: "#222",
  },
  error: { fontSize: 12, color: "#E24B4A", margin: "4px 0 0" },
  strengthTrack: { height: 4, borderRadius: 2, background: "#eee", marginTop: 6, overflow: "hidden" },
  strengthFill: { height: "100%", borderRadius: 2, transition: "width 0.3s, background 0.3s" },
  strengthLabel: { fontSize: 11, margin: "3px 0 0" },
  submitBtn: {
    width: "100%",
    padding: "10px",
    marginTop: 8,
    background: "#222",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
  },
  loginLink: { textAlign: "center", fontSize: 13, color: "#888", marginTop: "1rem" },
  link: { color: "#185FA5", cursor: "pointer", textDecoration: "underline" },
  successBox: { textAlign: "center", padding: "1.5rem 0" },
  successIcon: {
    width: 48, height: 48, borderRadius: "50%",
    background: "#E1F5EE",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 1rem",
  },
};