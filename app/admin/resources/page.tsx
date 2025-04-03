"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { BookOpen, Wind, Leaf, Plus, Pencil, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  getResources,
  createResource,
  updateResource,
  deleteResource,
  type Resource,
  type ResourceFormData,
} from "@/app/actions/resource-actions"

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [formData, setFormData] = useState<ResourceFormData>({
    title: "",
    description: "",
    content: "",
    category: "articles",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    // TODO: Add admin check here

    fetchResources()
  }, [user, router])

  const fetchResources = async () => {
    try {
      const data = await getResources()
      setResources(data || [])
    } catch (error) {
      console.error("Error fetching resources:", error)
      toast({
        title: "Error",
        description: "Failed to load resources.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateResource = async () => {
    setIsSubmitting(true)

    try {
      await createResource(formData)

      toast({
        title: "Success",
        description: "Resource created successfully.",
      })

      // Reset form and refresh resources
      setFormData({
        title: "",
        description: "",
        content: "",
        category: "articles",
      })

      fetchResources()
    } catch (error) {
      console.error("Error creating resource:", error)
      toast({
        title: "Error",
        description: "Failed to create resource. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateResource = async () => {
    if (!selectedResource) return

    setIsSubmitting(true)

    try {
      await updateResource(selectedResource.id, formData)

      toast({
        title: "Success",
        description: "Resource updated successfully.",
      })

      // Reset form and refresh resources
      setSelectedResource(null)
      setFormData({
        title: "",
        description: "",
        content: "",
        category: "articles",
      })

      fetchResources()
    } catch (error) {
      console.error("Error updating resource:", error)
      toast({
        title: "Error",
        description: "Failed to update resource. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteResource = async (id: string) => {
    try {
      await deleteResource(id)

      toast({
        title: "Success",
        description: "Resource deleted successfully.",
      })

      fetchResources()
    } catch (error) {
      console.error("Error deleting resource:", error)
      toast({
        title: "Error",
        description: "Failed to delete resource. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditResource = (resource: Resource) => {
    setSelectedResource(resource)
    setFormData({
      title: resource.title,
      description: resource.description,
      content: resource.content,
      category: resource.category,
      image_url: resource.image_url,
    })
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "meditation":
        return <Leaf className="h-5 w-5 text-primary" />
      case "breathing":
        return <Wind className="h-5 w-5 text-primary" />
      case "articles":
        return <BookOpen className="h-5 w-5 text-primary" />
      default:
        return <BookOpen className="h-5 w-5 text-primary" />
    }
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Resources</h1>
            <p className="text-muted-foreground">Add, edit, or delete self-care resources</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Resource</DialogTitle>
                <DialogDescription>Create a new self-care resource for users</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter resource title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter a short description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="articles">Articles</SelectItem>
                      <SelectItem value="meditation">Meditation</SelectItem>
                      <SelectItem value="breathing">Breathing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter the full content"
                    rows={8}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image_url">Image URL (Optional)</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url || ""}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="Enter an image URL"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateResource} disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Resource"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Resources</CardTitle>
            <CardDescription>Manage your self-care library content</CardDescription>
          </CardHeader>
          <CardContent>
            {resources.length > 0 ? (
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div key={resource.id} className="flex items-start p-4 border rounded-md">
                    <div className="mr-4 mt-1">{getCategoryIcon(resource.category)}</div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                        <span className="font-medium text-lg">{resource.title}</span>
                        <span className="text-sm text-muted-foreground capitalize mt-1 sm:mt-0">
                          {resource.category}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{resource.content}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => handleEditResource(resource)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Edit Resource</DialogTitle>
                            <DialogDescription>Update the details of this resource</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-title">Title</Label>
                              <Input
                                id="edit-title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter resource title"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-description">Description</Label>
                              <Input
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter a short description"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-category">Category</Label>
                              <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="articles">Articles</SelectItem>
                                  <SelectItem value="meditation">Meditation</SelectItem>
                                  <SelectItem value="breathing">Breathing</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-content">Content</Label>
                              <Textarea
                                id="edit-content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Enter the full content"
                                rows={8}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-image_url">Image URL (Optional)</Label>
                              <Input
                                id="edit-image_url"
                                value={formData.image_url || ""}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="Enter an image URL"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" onClick={handleUpdateResource} disabled={isSubmitting}>
                              {isSubmitting ? "Updating..." : "Update Resource"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this resource? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteResource(resource.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No resources found. Create your first resource to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

