export default function PageHeader({ title }: { title: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    </div>
  )
}
