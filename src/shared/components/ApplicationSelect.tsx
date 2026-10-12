import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ApplicationSelectProps {
  applications: string[]
  value: string
  onChange: (application: string) => void
  includeAll?: boolean
  allLabel?: string
  placeholder?: string
  className?: string
}

/** Sélecteur d'application homogène (remplace les `<select>` natifs). */
export function ApplicationSelect({
  applications,
  value,
  onChange,
  includeAll = false,
  allLabel = "Toutes les applications",
  placeholder = "Choisir une application…",
  className = "w-[250px]",
}: ApplicationSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next ?? "")}>
      <SelectTrigger className={className} aria-label="Application">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAll ? <SelectItem value="">{allLabel}</SelectItem> : null}
        {applications.map((application) => (
          <SelectItem key={application} value={application}>
            {application}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
