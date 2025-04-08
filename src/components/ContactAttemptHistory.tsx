// "use client";

// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// interface ContactAttempt {
//   id: number;
//   attemptDate: string;
//   attemptedBy: string;
//   userRole: string;
//   minutes: number;
//   notes: string;
// }

// interface ContactAttemptHistoryProps {
//   patientId: string;
// }

// export default function ContactAttemptHistory({ patientId }: ContactAttemptHistoryProps) {
//   const [attempts, setAttempts] = useState<ContactAttempt[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [page, setPage] = useState(1);
//   const itemsPerPage = 5;

//   useEffect(() => {
//     const fetchContactAttempts = async () => {
//       try {
//         const response = await fetch(`http://localhost:4353/api/contact-attempts/${patientId}`);
//         if (!response.ok) throw new Error("Failed to fetch contact attempts");
//         const data: ContactAttempt[] = await response.json();
//         setAttempts(data);
//         setLoading(false);
//       } catch (err) {
//         setError((err as Error).message);
//         setLoading(false);
//       }
//     };

//     fetchContactAttempts();
//   }, [patientId]);

//   if (loading) return <p>Loading contact attempts...</p>;
//   if (error) return <p className="text-red-500">Error: {error}</p>;

//   const totalPages = Math.ceil(attempts.length / itemsPerPage);
//   const paginatedAttempts = attempts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//       <h2 className="text-xl font-semibold mb-4">Contact Attempt History</h2>
//       {attempts.length > 0 ? (
//         <>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Date</TableHead>
//                 <TableHead>Contacted By</TableHead>
//                 <TableHead>Role</TableHead>
//                 <TableHead>Minutes</TableHead>
//                 <TableHead>Notes</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {paginatedAttempts.map((attempt) => (
//                 <TableRow key={attempt.id}>
//                   <TableCell>{attempt.attemptDate}</TableCell>
//                   <TableCell>{attempt.attemptedBy}</TableCell>
//                   <TableCell>{attempt.userRole}</TableCell>
//                   <TableCell>{attempt.minutes}</TableCell>
//                   <TableCell>{attempt.notes}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//           <div className="flex justify-between mt-4">
//             <Button
//               onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
//               disabled={page === 1}
//             >
//               Previous
//             </Button>
//             <span>
//               Page {page} of {totalPages}
//             </span>
//             <Button
//               onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
//               disabled={page === totalPages}
//             >
//               Next
//             </Button>
//           </div>
//         </>
//       ) : (
//         <p>No contact attempts recorded.</p>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ContactAttempt {
  id: number;
  attemptDate: string;
  attemptedBy: string;
  userRole: string;
  minutes: number;
  notes: string;
}

interface ContactAttemptHistoryProps {
  patientId: string;
}

export default function ContactAttemptHistory({ patientId }: ContactAttemptHistoryProps) {
  const [attempts, setAttempts] = useState<ContactAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchContactAttempts = async () => {
      try {
        const response = await fetch(`http://localhost:4353/api/contact-attempts/${patientId}`);
        if (!response.ok) throw new Error("Failed to fetch contact attempts");
        const data: ContactAttempt[] = await response.json();
        setAttempts(data);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };

    fetchContactAttempts();
  }, [patientId]);

  if (loading) return <p>Loading contact attempts...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const totalPages = Math.ceil(attempts.length / itemsPerPage);
  const paginatedAttempts = attempts.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalMinutes = attempts.reduce((sum, attempt) => sum + attempt.minutes, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Contact Attempt History</h2>
        <p className="text-lg">Total Minutes: {totalMinutes}</p>
      </div>
      {attempts.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Contacted By</TableHead>
                <TableHead>Minutes</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAttempts.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell>{attempt.attemptDate}</TableCell>
                  <TableCell>{attempt.attemptedBy}</TableCell>
                  <TableCell>{attempt.minutes}</TableCell>
                  <TableCell>{attempt.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between mt-4">
            <Button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        <p>No contact attempts recorded.</p>
      )}
    </div>
  );
}