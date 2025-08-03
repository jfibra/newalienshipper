"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Package, MapPin, CreditCard, FileText, ArrowLeft, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

// Step Components
import { AddressSelectionStep } from "@/components/shipment/address-selection-step"
import { ParcelDetailsStep } from "@/components/shipment/parcel-details-step"
import { ShippingRatesStep } from "@/components/shipment/shipping-rates-step"
import { PaymentStep } from "@/components/shipment/payment-step"
import { SuccessStep } from "@/components/shipment/success-step"

// Types
import type { RecipientAddress, ShippingAddress } from "@/lib/types/address"
import type { Parcel, ShippingRate, Payment, Shipment } from "@/lib/types/shipment"

interface ShipmentData {
  // Step 1: Addresses
  fromAddress?: ShippingAddress
  toAddress?: RecipientAddress
  returnAddress?: ShippingAddress

  // Step 2: Parcel
  parcel?: Parcel

  // Step 3: Rates
  selectedRate?: ShippingRate
  availableRates?: ShippingRate[]

  // Step 4: Payment
  payment?: Payment

  // Step 5: Final shipment
  shipment?: Shipment

  // Optional
  tag?: string
}

const STEPS = [
  { id: 1, title: "Addresses", icon: MapPin, description: "Select shipping addresses" },
  { id: 2, title: "Parcel", icon: Package, description: "Enter package details" },
  { id: 3, title: "Rates", icon: FileText, description: "Choose shipping service" },
  { id: 4, title: "Payment", icon: CreditCard, description: "Complete payment" },
  { id: 5, title: "Success", icon: CheckCircle, description: "Shipment created" },
]

export default function CreateShipment() {
  const router = useRouter()
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [shipmentData, setShipmentData] = useState<ShipmentData>({})
  const [user, setUser] = useState<any>(null)

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const updateShipmentData = (data: Partial<ShipmentData>) => {
    setShipmentData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return shipmentData.fromAddress && shipmentData.toAddress
      case 2:
        return shipmentData.parcel
      case 3:
        return shipmentData.selectedRate
      case 4:
        return shipmentData.payment?.status === "succeeded"
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <AddressSelectionStep
            user={user}
            shipmentData={shipmentData}
            onUpdate={updateShipmentData}
            onNext={nextStep}
            isLoading={isLoading}
          />
        )
      case 2:
        return (
          <ParcelDetailsStep
            shipmentData={shipmentData}
            onUpdate={updateShipmentData}
            onNext={nextStep}
            onPrev={prevStep}
            isLoading={isLoading}
          />
        )
      case 3:
        return (
          <ShippingRatesStep
            shipmentData={shipmentData}
            onUpdate={updateShipmentData}
            onNext={nextStep}
            onPrev={prevStep}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )
      case 4:
        return (
          <PaymentStep
            shipmentData={shipmentData}
            onUpdate={updateShipmentData}
            onNext={nextStep}
            onPrev={prevStep}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            user={user}
          />
        )
      case 5:
        return (
          <SuccessStep
            shipmentData={shipmentData}
            onCreateAnother={() => {
              setCurrentStep(1)
              setShipmentData({})
            }}
            onGoToDashboard={() => router.push("/dashboard")}
          />
        )
      default:
        return null
    }
  }

  const progressPercentage = (currentStep / STEPS.length) * 100

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
        </div>
        <h1 className="text-3xl font-bold">Create Shipment</h1>
        <p className="text-muted-foreground mt-2">Follow the steps below to create and pay for your shipment</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium">
            Step {currentStep} of {STEPS.length}
          </span>
          <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="mb-8">
        <div className="flex justify-between">
          {STEPS.map((step, index) => {
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            const Icon = step.icon

            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div
                  className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2
                  ${
                    isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : isActive
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-background border-muted-foreground text-muted-foreground"
                  }
                `}
                >
                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="text-center">
                  <div className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">{step.description}</div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`
                    hidden lg:block absolute top-5 w-full h-0.5 -z-10
                    ${isCompleted ? "bg-green-500" : "bg-muted"}
                  `}
                    style={{ left: "50%", width: "calc(100% - 2.5rem)" }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {STEPS[currentStep - 1].icon({ className: "h-5 w-5" })}
            {STEPS[currentStep - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation Buttons */}
      {currentStep < 5 && (
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1 || isLoading}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <Button onClick={nextStep} disabled={!canProceedToNextStep() || isLoading}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
