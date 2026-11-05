import { BrandHeader, PhoneShell } from "@/components/PhoneShell";
import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <PhoneShell>
      <BrandHeader kicker="成为彼灯学员" />
      <RegisterForm />
    </PhoneShell>
  );
}
