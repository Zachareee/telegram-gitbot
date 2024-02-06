import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/github", async (req, res) => {
  const { text } = req.query;
  if (!text) return res.send("no text");
  // const data = await fetch(
  //   `https://api.telegram.org/bot${process.env.API_key}/sendMessage?chat_id=${process.env.CHAT_ID}&text=${text}&parse_mode=markdown`,
  //   {},
  // );
  // console.log(data);
  return res.send(text);
});

app.post("/github", async (req, res) => {
  const header = req.header("X-GitHub-Event");
  const {
    repository: { full_name: reponame },
    action,
  } = req.body;
  if (
    header === "pull_request" &&
    !(action === "assigned" || action === "edited")
  ) {
    const {
      html_url,
      number,
      title,
      user: { login: user },
    } = req.body.pull_request;
    const text = encodeURIComponent(
      `*${reponame}*\n[${title}](${html_url})\nPull request #${number} ${action} by ${user}`,
    );
    fetch(
      `https://api.telegram.org/bot${process.env.API_key}/sendMessage?chat_id=${process.env.CHAT_ID}&text=${text}&parse_mode=markdown`,
      {},
    );
  } else if (header === "deployment_status") {
    const { target_url, description } = req.body.deployment_status;
    const text = encodeURIComponent(
      `*${reponame}*\n*${description}*\nDeployment created [here](${target_url})`,
    );
    fetch(
      `https://api.telegram.org/bot${process.env.API_key}/sendMessage?chat_id=${process.env.CHAT_ID}&text=${text}&parse_mode=markdown`,
      {},
    );
  }
  return res.send("ok");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
