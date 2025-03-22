export interface CategoryTransaction {
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
    description?: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
  }
  
  export interface Transaction {
    id: string;
    branchId: string;
    branch_name?: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    categoryTransactionId?: string;
    categoryTransaction?: CategoryTransaction;
    payment_method?: string;
    transaction_date?: string;
    description?: string;
    isDeleted: boolean;
    createdAt: string;
  }
  
  export interface Branch {
    id: string;
    name: string;
  }
  
  export interface ResponseData<T> {
    total: number;
    data: T[];
  }