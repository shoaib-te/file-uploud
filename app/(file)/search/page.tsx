import { Suspense } from 'react'
import SearchPageContent from './SearchPageContent'

export default function SearchPage() {
  return (
    <Suspense fallback={<div role="status" className="p-4 text-sm text-gray-500">Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}