import serviceAccount from "../../mern-blog.json";
import { initializeApp, credential, ServiceAccount } from "firebase-admin";

const app = initializeApp({
  credential: credential.cert(serviceAccount as ServiceAccount),
});

export default app;
