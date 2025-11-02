import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-uw-purple mb-4">
            Fitted
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Your UW Wardrobe Assistant
          </p>
          <button
            onClick={() => setCount((count) => count + 1)}
            className="px-6 py-3 bg-uw-purple text-white rounded-lg hover:bg-uw-purple/90 transition"
          >
            Count is {count}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
