"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { logEvent } from "@/lib/events"

export default function AskQuestionBox({ quoteId }: { quoteId: string }) {

  const [question, setQuestion] = useState("")

  async function submitQuestion() {
    if (!question.trim()) {
      alert("Please enter a question")
      return
    }

    const { error } = await supabase
      .from("quotes")
      .update({
        status: "question_pending",
        customer_question: question.trim()
      })
      .eq("id", quoteId)

    if (error) {
      alert("Failed to send question")
    } else {
      await logEvent(quoteId, "question", `Customer asked: ${question.trim()}`)
      alert("Question sent to business")
      window.location.reload()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        className="border border-zinc-200 bg-zinc-50 p-4 rounded-xl text-sm font-medium outline-none focus:border-indigo-600"
        placeholder="Ask a question about this quote"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={3}
      />

      <button
        onClick={submitQuestion}
        className="bg-zinc-800 hover:bg-zinc-900 text-white px-4 py-3 rounded-xl font-bold transition-all"
      >
        Ask Question
      </button>
    </div>
  )
}