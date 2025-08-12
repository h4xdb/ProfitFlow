import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { Receipt, ReceiptBook, Task } from "@shared/schema";

const receiptFormSchema = z.object({
  receiptNumber: z.coerce.number().min(1, "Receipt number is required"),
  receiptBookId: z.string().min(1, "Receipt book is required"),
  taskId: z.string().min(1, "Task is required"),
  giverName: z.string().min(1, "Giver name is required"),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z.string().optional(),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
});

type ReceiptFormData = z.infer<typeof receiptFormSchema>;

interface ReceiptFormProps {
  receipt?: Receipt | null;
  receiptBooks: ReceiptBook[];
  tasks: Task[];
  onSuccess?: () => void;
}

export default function ReceiptForm({ receipt, receiptBooks, tasks, onSuccess }: ReceiptFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isCashCollector } = useAuth();

  const form = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      receiptNumber: receipt?.receiptNumber || 0,
      receiptBookId: receipt?.receiptBookId || "",
      taskId: receipt?.taskId || "",
      giverName: receipt?.giverName || "",
      address: receipt?.address || "",
      phoneNumber: receipt?.phoneNumber || "",
      amount: receipt ? Number(receipt.amount) : 0,
    },
  });

  const selectedBookId = form.watch("receiptBookId");

  // Get next receipt number for the selected book
  const { data: nextNumberData } = useQuery({
    queryKey: ["/api/receipts/next-number", selectedBookId],
    enabled: !!selectedBookId && !receipt,
  });

  // Update receipt number when book changes (for new receipts only)
  useEffect(() => {
    if (!receipt && nextNumberData && 'nextReceiptNumber' in nextNumberData) {
      form.setValue("receiptNumber", nextNumberData.nextReceiptNumber);
    }
  }, [nextNumberData, receipt, form]);

  const mutation = useMutation({
    mutationFn: (data: ReceiptFormData) => {
      if (receipt) {
        return apiRequest("PUT", `/api/receipts/${receipt.id}`, data);
      } else {
        return apiRequest("POST", "/api/receipts", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/receipts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financials"] });
      toast({
        title: "Success",
        description: receipt ? "Receipt updated successfully" : "Receipt created successfully",
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReceiptFormData) => {
    mutation.mutate(data);
  };

  // Filter receipt books based on user role
  const availableBooks = isCashCollector 
    ? receiptBooks.filter(book => book.assignedTo === user?.id)
    : receiptBooks;

  const selectedBook = receiptBooks.find(book => book.id === selectedBookId);
  const selectedTask = tasks.find(task => task.id === form.watch("taskId"));

  // Auto-select task when receipt book changes
  useEffect(() => {
    if (selectedBook && selectedBook.taskId !== form.watch("taskId")) {
      form.setValue("taskId", selectedBook.taskId);
    }
  }, [selectedBook, form]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="receiptBookId">Receipt Book</Label>
          <Select
            value={form.watch("receiptBookId")}
            onValueChange={(value) => form.setValue("receiptBookId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select receipt book" />
            </SelectTrigger>
            <SelectContent>
              {availableBooks.map((book) => (
                <SelectItem key={book.id} value={book.id}>
                  {book.bookNumber} ({book.startingReceiptNumber}-{book.endingReceiptNumber})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.receiptBookId && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.receiptBookId.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="receiptNumber">Receipt Number</Label>
          <Input
            id="receiptNumber"
            type="number"
            {...form.register("receiptNumber")}
            placeholder="Auto-filled"
            disabled={!receipt}
          />
          {form.formState.errors.receiptNumber && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.receiptNumber.message}
            </p>
          )}
          {selectedBook && (
            <p className="text-xs text-gray-500 mt-1">
              Range: {selectedBook.startingReceiptNumber} - {selectedBook.endingReceiptNumber}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="taskId">Task Category</Label>
        <Select
          value={form.watch("taskId")}
          onValueChange={(value) => form.setValue("taskId", value)}
          disabled={!!selectedBook}
        >
          <SelectTrigger>
            <SelectValue placeholder="Auto-selected from book" />
          </SelectTrigger>
          <SelectContent>
            {tasks.map((task) => (
              <SelectItem key={task.id} value={task.id}>
                {task.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedBook && (
          <p className="text-xs text-gray-500 mt-1">
            Automatically selected based on receipt book
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="giverName">Giver Name *</Label>
          <Input
            id="giverName"
            {...form.register("giverName")}
            placeholder="Full name of the donor"
          />
          {form.formState.errors.giverName && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.giverName.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            {...form.register("phoneNumber")}
            placeholder="Optional contact number"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address / House Number *</Label>
        <Input
          id="address"
          {...form.register("address")}
          placeholder="Full address or house number"
        />
        {form.formState.errors.address && (
          <p className="text-sm text-red-600 mt-1">
            {form.formState.errors.address.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="amount">Amount (₹) *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...form.register("amount")}
          placeholder="0.00"
        />
        {form.formState.errors.amount && (
          <p className="text-sm text-red-600 mt-1">
            {form.formState.errors.amount.message}
          </p>
        )}
      </div>

      {selectedTask && (
        <div className="bg-islamic-50 rounded-lg p-4">
          <h4 className="font-medium text-islamic-900 mb-2">Receipt Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Category:</span>
              <span className="ml-2 font-medium">{selectedTask.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Book:</span>
              <span className="ml-2 font-medium">{selectedBook?.bookNumber}</span>
            </div>
            <div>
              <span className="text-gray-600">Receipt #:</span>
              <span className="ml-2 font-medium">{form.watch("receiptNumber")}</span>
            </div>
            <div>
              <span className="text-gray-600">Amount:</span>
              <span className="ml-2 font-medium">
                ₹{form.watch("amount") ? Number(form.watch("amount")).toFixed(2) : "0.00"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="bg-islamic-600 hover:bg-islamic-700"
        >
          {mutation.isPending ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              {receipt ? "Updating..." : "Creating..."}
            </>
          ) : (
            receipt ? "Update Receipt" : "Create Receipt"
          )}
        </Button>
      </div>
    </form>
  );
}
