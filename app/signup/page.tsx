import { error } from "console";
import { executeQuery } from "../api/auth/signup/route";
import SignupPage from "../ui/SignUp/SignUpPage";

export default function Page() {
  console.log("here is the query");
  console.log(executeQuery("SELECT * FROM public.users", []));
  return <SignupPage />;
}
