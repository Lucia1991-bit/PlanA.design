import admin from "firebase-admin";

const serviceAccount = {
  type: "service_account",
  project_id: "plan-a-design-app",
  private_key_id: "eab4d1bd65c7b941e0820889512d1b23f42f31b1",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCXrw8du79VlInk\nR4+KPsIcIiZ5WOnByQLyMB10kPGm3mtlOSyp1EuwwyuaQd/Sn8Mm8K4SBeQvE5Jd\nehr0EFEtigtGhxS2sq+sfFDKfgx8t0qR+44FJV9sbokip1Cg0aMJH4sTVgOj8bz2\n0q+IgEwPqiCh5z46tJVLj+3xhaqOL9oyPpL47wPrW8FYXN7zPJ68CkaLcpN5s/ub\n3314/pIsjSmJ5u3VVpcokbq+8V2FZpdr/cEd2TM7N3RTu6XIhYBBvBDah11b23uw\nTSYjthzbbDmW5ID+D4q2ppiP9ZCh5dVyTVNnhTXSt5vcCgQGtUSjAkqGfSdtvm46\nSdOxIh1xAgMBAAECggEAH3RNo+qQQ4itLJG7Xh1kBs39IPpTZRxQOFVKcmbxOZuT\ndTbtQF12AbaDRvaEmcqH/z33NuUSW8HI/wnoZ3avwswGyQ4PeVBmFhRkc40+fSlM\nNSgPXBlTJ6rnVLCSC3tVffmUz0JtuFRTjXKEtH94ZmIu6KwJj0Zt1DDJVKWVh+zq\nDs5aMQnoWvXTj4xClFXg/BQxzMIJjnyEddS84jRTYkuwhvUKmIE8p5aIDqo++fFP\n0LoZjkVBUun0JwGO+Hs6UGhOuKTjqJLx7qj34/fpUE7r+cDBbwQq1YMlyREyU+Oo\nZJuzjreXd7GxwuKo9eCfEiZf4OkwYQ6ahkNtrlkSvQKBgQDQHfU9wPhTtzZvp3/0\n+uD51mmChveMzzMl9SnhylMmxgXjBwdeA6aBJqTS1T0ukIl5ja5UUfjYK/+aqQju\ng0gZ1fhPWcKvuvcchf5wlu3aFl2jduY22Vx/09Kn100Dlj9kvsyLvhS+iWi7158x\nU4WC75vQeAGjdTm03Px560JA1QKBgQC6lTMLRDcagOmlz10M66OZq8CmT/kZ4R15\nlVaCkaR7K2XIJRnq/U2tpOxooJsQ+Ba/mQUTGM0M+NgNo5B3RVlgfoFWuedT9c62\nt8LmVstarK1rbqg5ctj+F6IWU05bRFv8eyjiGecsaJHf4RIxaDpNOLmjFT0u2dtX\nBgWKTSXYLQKBgQCtK4BYtizrW9PL7FAohGiW+rYoii2J2Q7yUqFa44N1C+jyE3Mp\n41e0t3cGh7C1AkeiASZBu0OYfGPfSS/JZyujc8t+G25H0wazkTs6bBvWEC4ySkkc\n8phpNNRgHGJUzbxKFAkXbj7MnIGta6lm3dyGKuI4AOM8I9q0h/z9ZahnUQKBgDov\nyUlcLqsPRM42ytf6rHyB+YRkMFUHxT9jeSUi8l6O/CDcoSaNdCoQ4sEGRRWXqNB7\nkf+QnnHLMOWf+q+XavYSvZckRqYCZELLL/bRXn2amEKGseOok086Y4v+0tLXkLA+\nYFOSrGtG+ScOc7QAwx3N8OaQ+xGfUy3ibNvij0jJAoGAYWeK46Ko0L/5Taf3JV2h\nR1G3+Kskzi7tu5w4w45xsxOac2Vv12aLAcaEnMFW630GDqx31qj+pjm5zHFwsWGA\nkZm+PwdPVIaJ7wUPKyENmC0+wlK2obpog6nczXRi4pksWX8OK63pBO/KY0ynW0qg\njq6eghAlpI6z5k1L46fQX9Y=\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-yhnd4@plan-a-design-app.iam.gserviceaccount.com",
  client_id: "105248469460846277936",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-yhnd4%40plan-a-design-app.iam.gserviceaccount.com",
};

const storageBucket = "gs://plan-a-design-app.appspot.com";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      storageBucket: storageBucket,
    });
    console.log("Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
    throw error;
  }
}

export const adminDb = admin.firestore();
export const adminStorage = admin.storage().bucket();
