// these function will connecto n8n (local) webhook for append login history to google sheets
export async function historyLogin(email, status) {
  // use n8n webhook to save login history to google sheet n8n-sheets (local)
  await fetch(`${webhook}/n8n-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, status }),
  });
  console.log("use webhook successfully");
  console.log(email, status);
}

export async function historyRegister(name, email, status) {
  // use n8n webhook to save login history to google sheet n8n-sheets (local)
  await fetch(`${webhook}/n8n-register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, status }),
  });
  console.log("use webhook successfully");
  console.log(name, email, status);
}
