"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Play, Pause, RefreshCw, Info, Zap, Activity, Waves } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function MindVisualizerPage() {
  const [activeTab, setActiveTab] = useState("neurons")
  const [isPlaying, setIsPlaying] = useState(false)
  const [neuronSpeed, setNeuronSpeed] = useState(50)
  const [brainwaveFrequency, setBrainwaveFrequency] = useState(10)
  const [brainActivity, setBrainActivity] = useState(50)
  const [showInfo, setShowInfo] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const { toast } = useToast()

  // Neuron visualization
  useEffect(() => {
    if (activeTab !== "neurons" || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Create neurons
    const neurons: Neuron[] = []
    const numNeurons = 50

    for (let i = 0; i < numNeurons; i++) {
      neurons.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 2,
        connections: [],
        active: false,
        lastActive: 0,
        activationThreshold: Math.random() * 1000,
      })
    }

    // Create connections
    for (let i = 0; i < numNeurons; i++) {
      const neuron = neurons[i]
      const numConnections = Math.floor(Math.random() * 3) + 1

      for (let j = 0; j < numConnections; j++) {
        const targetIndex = Math.floor(Math.random() * numNeurons)
        if (targetIndex !== i) {
          neuron.connections.push(targetIndex)
        }
      }
    }

    let time = 0
    const speed = neuronSpeed / 50 // Normalize speed

    const animate = () => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update time
      time += speed

      // Draw connections
      ctx.strokeStyle = "rgba(100, 100, 255, 0.2)"
      ctx.lineWidth = 1

      for (let i = 0; i < numNeurons; i++) {
        const neuron = neurons[i]

        for (const targetIndex of neuron.connections) {
          const target = neurons[targetIndex]
          ctx.beginPath()
          ctx.moveTo(neuron.x, neuron.y)
          ctx.lineTo(target.x, target.y)
          ctx.stroke()
        }
      }

      // Activate neurons
      for (let i = 0; i < numNeurons; i++) {
        const neuron = neurons[i]

        if (time - neuron.lastActive > neuron.activationThreshold) {
          neuron.active = true
          neuron.lastActive = time

          // Activate connected neurons
          for (const targetIndex of neuron.connections) {
            const target = neurons[targetIndex]
            setTimeout(() => {
              target.active = true
              target.lastActive = time
            }, 100 * speed)
          }

          setTimeout(() => {
            neuron.active = false
          }, 200 * speed)
        }
      }

      // Draw neurons
      for (let i = 0; i < numNeurons; i++) {
        const neuron = neurons[i]

        ctx.beginPath()
        ctx.arc(neuron.x, neuron.y, neuron.radius, 0, Math.PI * 2)

        if (neuron.active) {
          ctx.fillStyle = "rgba(100, 100, 255, 0.8)"
        } else {
          ctx.fillStyle = "rgba(100, 100, 255, 0.3)"
        }

        ctx.fill()
      }

      // Draw signal pulses
      for (let i = 0; i < numNeurons; i++) {
        const neuron = neurons[i]

        if (neuron.active) {
          for (const targetIndex of neuron.connections) {
            const target = neurons[targetIndex]

            const dx = target.x - neuron.x
            const dy = target.y - neuron.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            const progress = ((time - neuron.lastActive) * speed * 5) / distance

            if (progress > 0 && progress < 1) {
              const x = neuron.x + dx * progress
              const y = neuron.y + dy * progress

              ctx.beginPath()
              ctx.arc(x, y, 2, 0, Math.PI * 2)
              ctx.fillStyle = "rgba(100, 200, 255, 0.8)"
              ctx.fill()
            }
          }
        }
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [activeTab, isPlaying, neuronSpeed])

  // Brainwave visualization
  useEffect(() => {
    if (activeTab !== "brainwaves" || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Create brainwaves
    const brainwaves = [
      { name: "Delta", frequency: 2, amplitude: 30, color: "rgba(100, 100, 255, 0.8)", offset: 50 },
      { name: "Theta", frequency: 5, amplitude: 25, color: "rgba(100, 200, 255, 0.8)", offset: 120 },
      { name: "Alpha", frequency: 10, amplitude: 20, color: "rgba(100, 255, 200, 0.8)", offset: 190 },
      { name: "Beta", frequency: 20, amplitude: 10, color: "rgba(200, 255, 100, 0.8)", offset: 260 },
      { name: "Gamma", frequency: 40, amplitude: 5, color: "rgba(255, 200, 100, 0.8)", offset: 330 },
    ]

    let time = 0
    const frequency = brainwaveFrequency / 10 // Normalize frequency

    const animate = () => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update time
      time += 0.05 * frequency

      // Draw brainwaves
      for (const wave of brainwaves) {
        ctx.beginPath()

        // Draw wave name
        ctx.font = "14px Arial"
        ctx.fillStyle = wave.color
        ctx.fillText(wave.name, 10, wave.offset)

        // Draw wave
        for (let x = 0; x < canvas.width; x += 1) {
          const y = wave.offset + Math.sin((x * 0.02 * wave.frequency) / 10 + time) * wave.amplitude

          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.strokeStyle = wave.color
        ctx.lineWidth = 2
        ctx.stroke()
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [activeTab, isPlaying, brainwaveFrequency])

  // Brain activity visualization
  useEffect(() => {
    if (activeTab !== "brain-activity" || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Create brain regions
    const regions = [
      {
        name: "Frontal Lobe",
        x: canvas.width * 0.3,
        y: canvas.height * 0.3,
        radius: 50,
        color: "rgba(255, 100, 100, 0.6)",
        activity: 0,
      },
      {
        name: "Parietal Lobe",
        x: canvas.width * 0.7,
        y: canvas.height * 0.3,
        radius: 40,
        color: "rgba(100, 255, 100, 0.6)",
        activity: 0,
      },
      {
        name: "Temporal Lobe",
        x: canvas.width * 0.2,
        y: canvas.height * 0.5,
        radius: 35,
        color: "rgba(100, 100, 255, 0.6)",
        activity: 0,
      },
      {
        name: "Occipital Lobe",
        x: canvas.width * 0.8,
        y: canvas.height * 0.5,
        radius: 30,
        color: "rgba(255, 255, 100, 0.6)",
        activity: 0,
      },
      {
        name: "Cerebellum",
        x: canvas.width * 0.5,
        y: canvas.height * 0.7,
        radius: 45,
        color: "rgba(255, 100, 255, 0.6)",
        activity: 0,
      },
    ]

    let time = 0
    const activity = brainActivity / 50 // Normalize activity

    const animate = () => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update time
      time += 0.05

      // Draw brain outline
      ctx.beginPath()
      ctx.ellipse(canvas.width / 2, canvas.height / 2, canvas.width * 0.4, canvas.height * 0.35, 0, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(150, 150, 150, 0.5)"
      ctx.lineWidth = 2
      ctx.stroke()

      // Update and draw regions
      for (const region of regions) {
        // Update activity
        region.activity = 0.5 + 0.5 * Math.sin(time * (0.5 + Math.random() * 0.5) + Math.random() * 10)
        region.activity *= activity

        // Draw region
        ctx.beginPath()
        ctx.arc(region.x, region.y, region.radius * (0.8 + region.activity * 0.2), 0, Math.PI * 2)

        const alpha = 0.3 + region.activity * 0.5
        const color = region.color.replace("0.6", alpha.toString())

        ctx.fillStyle = color
        ctx.fill()

        // Draw region name
        ctx.font = "12px Arial"
        ctx.fillStyle = "rgba(50, 50, 50, 0.8)"
        ctx.fillText(region.name, region.x - region.radius / 2, region.y)
      }

      // Draw connections between regions
      ctx.lineWidth = 1

      for (let i = 0; i < regions.length; i++) {
        const region1 = regions[i]

        for (let j = i + 1; j < regions.length; j++) {
          const region2 = regions[j]

          const activity = (region1.activity + region2.activity) / 2

          if (activity > 0.3) {
            ctx.beginPath()
            ctx.moveTo(region1.x, region1.y)
            ctx.lineTo(region2.x, region2.y)

            const alpha = activity * 0.5
            ctx.strokeStyle = `rgba(150, 150, 255, ${alpha})`

            ctx.stroke()
          }
        }
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [activeTab, isPlaying, brainActivity])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const resetVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    setIsPlaying(false)

    setTimeout(() => {
      setIsPlaying(true)
    }, 100)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    setIsPlaying(true)
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Mind Visualizer</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore interactive visualizations of brain activity, neural networks, and brainwaves to better understand
            your mind.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Interactive Brain Visualizations</CardTitle>
                <CardDescription>
                  Explore different aspects of brain function through these interactive models
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowInfo(!showInfo)}
                title="Visualization Information"
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 py-4 bg-muted/50"
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">About These Visualizations</h3>
                      <p className="text-sm text-muted-foreground">
                        These interactive visualizations are simplified representations of brain activity designed to
                        help you understand different aspects of how your mind works. While they are not medically
                        accurate simulations, they illustrate key concepts in neuroscience in an engaging way.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-500" />
                          Neurons & Synapses
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Visualizes how neurons connect and communicate through electrical signals, forming the basis
                          of all brain activity.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Waves className="h-4 w-4 text-purple-500" />
                          Brainwaves
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Shows the different types of brainwaves (Delta, Theta, Alpha, Beta, Gamma) that correspond to
                          different mental states.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Activity className="h-4 w-4 text-green-500" />
                          Brain Activity
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Demonstrates how different regions of the brain activate and communicate during various mental
                          processes.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Tabs defaultValue="neurons" onValueChange={handleTabChange}>
              <div className="px-6 pt-2">
                <TabsList className="w-full">
                  <TabsTrigger value="neurons" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span className="hidden sm:inline">Neurons & Synapses</span>
                    <span className="sm:hidden">Neurons</span>
                  </TabsTrigger>
                  <TabsTrigger value="brainwaves" className="flex items-center gap-2">
                    <Waves className="h-4 w-4" />
                    <span className="hidden sm:inline">Brainwaves</span>
                    <span className="sm:hidden">Waves</span>
                  </TabsTrigger>
                  <TabsTrigger value="brain-activity" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="hidden sm:inline">Brain Activity</span>
                    <span className="sm:hidden">Activity</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <div className="h-[400px] bg-muted/30 rounded-md overflow-hidden">
                  <canvas ref={canvasRef} className="w-full h-full" />
                </div>

                <div className="mt-6 space-y-6">
                  <div className="flex justify-center space-x-4">
                    <Button onClick={togglePlayPause} variant="outline" size="icon" className="h-12 w-12 rounded-full">
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                    </Button>
                    <Button
                      onClick={resetVisualization}
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full"
                    >
                      <RefreshCw className="h-5 w-5" />
                    </Button>
                  </div>

                  <TabsContent value="neurons" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Neural Activity Speed</label>
                        <span className="text-sm text-muted-foreground">{neuronSpeed}%</span>
                      </div>
                      <Slider
                        value={[neuronSpeed]}
                        min={10}
                        max={100}
                        step={1}
                        onValueChange={(value) => setNeuronSpeed(value[0])}
                      />
                    </div>

                    <div className="p-4 bg-muted/50 rounded-md">
                      <h3 className="text-sm font-medium mb-2">Did You Know?</h3>
                      <p className="text-xs text-muted-foreground">
                        Your brain contains approximately 86 billion neurons, each connected to thousands of others.
                        These connections, called synapses, allow neurons to communicate through electrical and chemical
                        signals, forming the basis of all thoughts, emotions, and actions.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="brainwaves" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Brainwave Frequency</label>
                        <span className="text-sm text-muted-foreground">{brainwaveFrequency} Hz</span>
                      </div>
                      <Slider
                        value={[brainwaveFrequency]}
                        min={1}
                        max={40}
                        step={1}
                        onValueChange={(value) => setBrainwaveFrequency(value[0])}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium">Delta (0.5-4 Hz)</h4>
                        <Progress value={brainwaveFrequency <= 4 ? 100 : 20} className="h-2" />
                        <p className="text-xs text-muted-foreground">Deep sleep, healing</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-medium">Theta (4-8 Hz)</h4>
                        <Progress
                          value={brainwaveFrequency > 4 && brainwaveFrequency <= 8 ? 100 : 20}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">Meditation, creativity</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-medium">Alpha (8-13 Hz)</h4>
                        <Progress
                          value={brainwaveFrequency > 8 && brainwaveFrequency <= 13 ? 100 : 20}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">Relaxed awareness, calm</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-medium">Beta (13-30 Hz)</h4>
                        <Progress
                          value={brainwaveFrequency > 13 && brainwaveFrequency <= 30 ? 100 : 20}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">Alert, focused, active thinking</p>
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <h4 className="text-xs font-medium">Gamma (30+ Hz)</h4>
                        <Progress value={brainwaveFrequency > 30 ? 100 : 20} className="h-2" />
                        <p className="text-xs text-muted-foreground">Higher cognitive processing, peak concentration</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="brain-activity" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Brain Activity Level</label>
                        <span className="text-sm text-muted-foreground">{brainActivity}%</span>
                      </div>
                      <Slider
                        value={[brainActivity]}
                        min={10}
                        max={100}
                        step={1}
                        onValueChange={(value) => setBrainActivity(value[0])}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-md">
                        <h3 className="text-sm font-medium mb-2">Brain Regions</h3>
                        <ul className="text-xs space-y-1">
                          <li>
                            <span className="font-medium">Frontal Lobe:</span> Decision making, planning, problem
                            solving
                          </li>
                          <li>
                            <span className="font-medium">Parietal Lobe:</span> Sensory processing, spatial awareness
                          </li>
                          <li>
                            <span className="font-medium">Temporal Lobe:</span> Language, memory, emotion
                          </li>
                          <li>
                            <span className="font-medium">Occipital Lobe:</span> Visual processing
                          </li>
                          <li>
                            <span className="font-medium">Cerebellum:</span> Movement coordination, balance
                          </li>
                        </ul>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-md">
                        <h3 className="text-sm font-medium mb-2">Did You Know?</h3>
                        <p className="text-xs text-muted-foreground">
                          Different mental activities activate different regions of your brain. For example, meditation
                          increases activity in the prefrontal cortex (attention) while reducing activity in the
                          amygdala (stress response), which explains its calming effects.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </CardContent>
          <CardFooter className="px-6 py-4 border-t">
            <p className="text-xs text-muted-foreground">
              Note: These visualizations are simplified representations for educational purposes and do not reflect
              actual brain scans or medical data.
            </p>
          </CardFooter>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Neural Connections
              </CardTitle>
              <CardDescription>How neurons communicate</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Your brain contains approximately 86 billion neurons, each connected to thousands of others through
                synapses. These connections form the basis of all your thoughts, emotions, and actions.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Synapse Strength</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="h-5 w-5 text-purple-500" />
                Mental States
              </CardTitle>
              <CardDescription>Different brainwave patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Your brain produces different types of brainwaves depending on your mental state. From deep sleep
                (delta) to high focus (gamma), these patterns reflect your level of consciousness and activity.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Current State: Alpha</span>
                  <span>Relaxed Awareness</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Brain Plasticity
              </CardTitle>
              <CardDescription>Your brain's ability to change</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Neuroplasticity is your brain's ability to reorganize itself by forming new neural connections. This
                allows you to learn new skills, adapt to changes, and recover from injuries.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Adaptability</span>
                  <span>82%</span>
                </div>
                <Progress value={82} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Types for neuron visualization
type Neuron = {
  x: number
  y: number
  radius: number
  connections: number[]
  active: boolean
  lastActive: number
  activationThreshold: number
}

