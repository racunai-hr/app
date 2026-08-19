import { ModulePlaceholder } from '@/components/app-shell/ModulePlaceholder';
import { MODULE_PLACEHOLDERS } from '@/lib/dashboard/nav';

export function PlaceholderPage({
  id,
}: {
  id: keyof typeof MODULE_PLACEHOLDERS;
}) {
  return <ModulePlaceholder {...MODULE_PLACEHOLDERS[id]} />;
}
