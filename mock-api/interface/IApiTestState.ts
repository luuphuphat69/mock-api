export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Interface next
interface APITestModalProps {
  url: string;
  apiKey: string;
  method: Method;
  resource: IResource;
  onClose: () => void;
}
