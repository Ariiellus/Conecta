interface ContactItemProps {
  name: string;
  initials: string;
  color: string;
}

export default function ContactItem({ name, initials, color }: ContactItemProps) {
  return (
    <div className="flex-shrink-0 flex flex-col items-center">
      <div className={`h-14 w-14 rounded-full ${color} flex items-center justify-center text-white font-medium`}>
        {initials}
      </div>
      <span className="mt-2 text-sm">{name}</span>
    </div>
  );
}
