import React, { FC, useEffect, useState } from "react"
import axios from "axios"
import { Dialog } from "@/components/common/ui/Dialog"
import Icon from "@/components/common/ui/Icon"
import { useSettingsStore, Toast } from "@/stores/settings"

export const DialogFeedback: FC = () => {
  const { dialog, closeDialog, toast, setToast } = useSettingsStore(
    (state) => state
  )
  const isOpen = dialog.isOpen && dialog.type === "feedback"
  const [feedback, setFeedback] = useState("")
  const [rating, setRating] = useState<number | undefined>(undefined)
  const [message, setMessage] = useState("")
  const [disabled, setDisabled] = useState(true)

  const handleReset = () => {
    setFeedback("")
    setRating(undefined)
    setMessage("")
  }

  const handleValidation = () => {
    if (rating === undefined && feedback === "") {
      setDisabled(true)
    } else {
      setDisabled(false)
    }
  }

  const handleToast = () => {
    const i: Toast = {
      content: "Thank you for your feedback !",
      type: "default",
      isOpen: true,
    }
    setToast([...toast, i])
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    // if(rating === undefined){
    //   setMessage("Please rate the app before submitting your feedback.");
    //   return
    // }
    try {
      const response = await axios.post(
        "https://asia-northeast1-shintaro-s-private.cloudfunctions.net/addNotionItem",
        {
          feedback,
          rating,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      if (response.status === 200) {
        handleReset()
        closeDialog()
        handleToast()
      } else {
        setMessage("Failed to send feedback. Please try again.")
      }
    } catch (error) {
      console.error("Error sending feedback:", error)
      setMessage("Error sending feedback. Please try again.")
    }
  }

  useEffect(() => {
    handleValidation()
  }, [rating, feedback])

  useEffect(() => {
    handleReset()
  }, [isOpen])

  return (
    <Dialog isOpen={isOpen} onClose={() => closeDialog()} className="max-w-sm">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col font-sans p-4 w-full gap-6 text-content-h">
        <h3 className="text-content-h text-xl font-medium px-2">
          Send feedback,
          <br />
          <span className="text-content-l">We read them all!</span>
        </h3>

        <div className="grid grid-cols-5 gap-2 w-full max-w-[320px] mx-auto">
          {[...Array(5)].map((_, i) => (
            <button
              value={i + 1}
              onClick={(e) => {
                e.preventDefault()
                setRating(i)
              }}
              key={i}
              className={`size-full rounded-full flex items-center justify-center ${
                rating === i ? "bg-content-h-a" : "bg-content-xl-a"
              }`}
              style={{ width: "100%", height: "100%", aspectRatio: "1 / 1" }}>
              <img
                src={`/images/ratings/0${i + 1}.png`}
                alt=""
                className="size-1/2"
              />
            </button>
          ))}
        </div>
        <div>
          <label className="text-lg flex flex-col gap-3 font-medium px-2 mb-3">
            How can we improve your experience ?
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
            placeholder="Write your feedback here..."
            className="rounded-md w-full min-h-32 bg-content-xl-a p-3 text-base focus:outline-none focus:ring-1 focus:ring-content-l-a"
          />
        </div>

        {message && <p className="text-sm text-system-error">{message}</p>}
        <button
          type="submit"
          className={`w-full py-2 rounded-full text-white font-semibold ${
            disabled
              ? "bg-content-l-a text-content-m-a cursor-not-allowed"
              : "bg-content-h-a"
          }`}
          disabled={disabled}>
          Submit
        </button>
        <div
          className="size-8 flex items-center justify-center absolute top-4 right-4 cursor-pointer bg-content-xl-a rounded-full hover:scale-110"
          onClick={() => closeDialog()}>
          <Icon name="close" />
        </div>
      </form>
    </Dialog>
  )
}

export default DialogFeedback
