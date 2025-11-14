import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AgentStatsTable() {
  const stats = [
    {
      ecosystem: "Custom",
      mindshare: "61.43%",
      change24h: "-3.1",
      marketCap: "$4.16B",
      echo: "78.4%",
      volume: "$143.93M",
    },
    // Add more data...
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ecosystem name</TableHead>
          <TableHead>Mindshare</TableHead>
          <TableHead>Δ24H</TableHead>
          <TableHead>Market cap</TableHead>
          <TableHead>Echo</TableHead>
          <TableHead>Volume</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stats.map((stat, index) => (
          <TableRow key={index}>
            <TableCell>{stat.ecosystem}</TableCell>
            <TableCell>{stat.mindshare}</TableCell>
            <TableCell className={stat.change24h.startsWith('-') ? 'text-red-500' : 'text-green-500'}>
              {stat.change24h}
            </TableCell>
            <TableCell>{stat.marketCap}</TableCell>
            <TableCell>{stat.echo}</TableCell>
            <TableCell>{stat.volume}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 