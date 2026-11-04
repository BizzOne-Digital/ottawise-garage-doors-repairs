import { getSettingsFresh } from "@/lib/adminData";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettingsFresh();
  return <SettingsForm initial={settings} />;
}
