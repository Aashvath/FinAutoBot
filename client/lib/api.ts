export async function analyzeStatement(file: File, risk: number) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("risk", risk.toString())

  const res = await fetch("http://localhost:8000/analyze", {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    throw new Error("Analysis failed")
  }

  return res.json()
}
