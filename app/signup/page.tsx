import { error } from "console";
import { executeQuery, testDatabaseConnection } from "../api/auth/signup/route";
import SignupPage from "../ui/SignUp/SignUpPage";

export default function Page() {
  console.log(testDatabaseConnection());
  console.log(executeQuery("SELECT * FROM public.users", []));
  return <SignupPage />;
}
