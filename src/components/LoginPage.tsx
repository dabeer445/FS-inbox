import toast from "react-hot-toast";
import { Disclaimer } from "./interface/Disclaimer";
import { storeCredentials } from "../services/storage";
import { useBotpressClient } from "../hooks/botpressClient";
import { useState } from "react";

interface LoginPageProps {
  clearsCredentialsAndClient: () => void;
  heading: string;
  subheading: string;
}

export function LoginPage({
  clearsCredentialsAndClient,
  heading,
  subheading,
}: LoginPageProps) {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [userBotpressToken] = useState<string>(
    import.meta.env.VITE_BP_PAT
  );
  const [userBotpressURL] = useState<string>(
    import.meta.env.VITE_BP_URL
  );

  const { createClient } = useBotpressClient();

  function handleSubmitCredentials(token: string, url: string) {
    if (!userName || !password) {
      toast.error("Please inform all the credentials");
      return;
    }

    if (userName.trim() !== import.meta.env.VITE_USER || password.trim() !== import.meta.env.VITE_KEY) {
      toast.error("Please input the correct credentials");
      setUserName("");
      setPassword("");
      return;
    }

    try {
      const splittedURL = url.split("/");
      const workspaceId = splittedURL[4];
      const botId = splittedURL[6];

      if (!workspaceId || !botId) {
        throw new Error();
      }

      const bpClient = createClient(token, workspaceId, botId);

      if (!bpClient) {
        throw new Error();
      }

      // saves the encrypted credentials to storage
      storeCredentials({ token, workspaceId, botId });
    } catch (error) {
      toast.error("You have informed invalid credentials");

      clearsCredentialsAndClient();
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col gap-5 w-full max-w-xl mx-auto my-auto">
        <form className="border-2 p-10 rounded-md shadow-sm flex flex-col gap-3">
          <Disclaimer full />

          <label htmlFor="" className="flex flex-col gap-1">
            <span className="text-lg font-medium">
              {/* Bot Dashboard URL */}
              {heading}
            </span>
            <input
              type="text"
              className="px-3 py-2 rounded-md border-2 bg-white"
              value={userName}
              onChange={(event) => {
                setUserName(event.target.value);
              }}
            />
            <span className="text-sm italic text-gray-600">
              Go to app.botpress.cloud, open your bot and copy the link
            </span>
          </label>

          <label htmlFor="" className="flex flex-col gap-1">
            <span className="text-lg font-medium">
              {subheading}
              {/* Personal Access Token */}
            </span>
            <input
              type="password"
              className="px-3 py-2 rounded-md border-2 bg-white"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
            />
            <span className="text-sm italic text-gray-600">
              You can find this by clicking your avatar in the dashboard. It
              will be saved only on your computer!
            </span>
          </label>

          <button
            className="w-full p-3 rounded-md bg-blue-500 mx-auto"
            type="button"
            onClick={() =>
              handleSubmitCredentials(userBotpressToken, userBotpressURL)
            }
          >
            <span className="text-xl text-white font-medium">Save</span>
          </button>
        </form>
      </div>
    </div>
  );
}
