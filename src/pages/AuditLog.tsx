
import { useState, useEffect } from "react";
import { getLogs, LogEntry, LogLevel, LogCategory } from "@/utils/audit-logger";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<LogLevel | "">("");
  const [filterCategory, setFilterCategory] = useState<LogCategory | "">("");
  const [filterUser, setFilterUser] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  
  useEffect(() => {
    // Load logs
    loadLogs();
  }, []);
  
  useEffect(() => {
    // Filter logs when filter criteria change
    filterLogs();
  }, [logs, filterLevel, filterCategory, filterUser, filterDateFrom, filterDateTo]);
  
  const loadLogs = () => {
    setLoading(true);
    // Get all logs
    const allLogs = getLogs();
    setLogs(allLogs);
    setFilteredLogs(allLogs);
    setLoading(false);
  };
  
  const filterLogs = () => {
    let filtered = [...logs];
    
    // Apply level filter
    if (filterLevel) {
      filtered = filtered.filter(log => log.level === filterLevel);
    }
    
    // Apply category filter
    if (filterCategory) {
      filtered = filtered.filter(log => log.category === filterCategory);
    }
    
    // Apply user filter
    if (filterUser) {
      filtered = filtered.filter(log => 
        (log.userEmail?.toLowerCase().includes(filterUser.toLowerCase())) ||
        (log.userId?.toLowerCase().includes(filterUser.toLowerCase()))
      );
    }
    
    // Apply date range filter
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      filtered = filtered.filter(log => new Date(log.timestamp) >= fromDate);
    }
    
    if (filterDateTo) {
      // Add one day to include the entire day
      const toDate = new Date(filterDateTo);
      toDate.setDate(toDate.getDate() + 1);
      filtered = filtered.filter(log => new Date(log.timestamp) <= toDate);
    }
    
    setFilteredLogs(filtered);
  };
  
  const resetFilters = () => {
    setFilterLevel("");
    setFilterCategory("");
    setFilterUser("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Function to get appropriate badge class based on log level
  const getLevelBadgeClass = (level: LogLevel) => {
    switch (level) {
      case LogLevel.INFO:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case LogLevel.WARNING:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case LogLevel.ERROR:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Audit Logs</h1>
      </div>
      
      <div className="bg-card border border-border/40 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Filter Logs</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <Label htmlFor="level-filter" className="mb-1 block">Log Level</Label>
            <Select value={filterLevel} onValueChange={(value) => setFilterLevel(value as LogLevel)}>
              <SelectTrigger id="level-filter">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value={LogLevel.INFO}>Info</SelectItem>
                <SelectItem value={LogLevel.WARNING}>Warning</SelectItem>
                <SelectItem value={LogLevel.ERROR}>Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="category-filter" className="mb-1 block">Category</Label>
            <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as LogCategory)}>
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value={LogCategory.AUTH}>Authentication</SelectItem>
                <SelectItem value={LogCategory.FILE}>File Operation</SelectItem>
                <SelectItem value={LogCategory.SECURITY}>Security</SelectItem>
                <SelectItem value={LogCategory.SYSTEM}>System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="user-filter" className="mb-1 block">User</Label>
            <Input
              id="user-filter"
              placeholder="Filter by user"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            />
          </div>
          
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <Label htmlFor="date-filter" className="mb-1 block">Date Range</Label>
            <div className="flex gap-2">
              <Input
                id="date-from"
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="flex-1"
              />
              <span className="flex items-center">to</span>
              <Input
                id="date-to"
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={resetFilters} className="mr-2">
            Reset Filters
          </Button>
        </div>
      </div>
      
      <div className="bg-card border border-border/40 rounded-lg overflow-hidden">
        <Table>
          <TableCaption>Showing {filteredLogs.length} audit log entries</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead className="w-[100px]">Level</TableHead>
              <TableHead className="w-[120px]">Category</TableHead>
              <TableHead className="w-[120px]">User</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading audit logs...
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log, index) => (
                <TableRow key={`${log.timestamp}-${index}`}>
                  <TableCell className="font-mono text-xs">
                    {formatDate(log.timestamp)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeClass(log.level)}`}>
                      {log.level}
                    </span>
                  </TableCell>
                  <TableCell>{log.category}</TableCell>
                  <TableCell className="text-sm">
                    {log.userEmail ? (
                      <span className="truncate max-w-[100px] inline-block">{log.userEmail}</span>
                    ) : (
                      <span className="text-muted-foreground">System</span>
                    )}
                  </TableCell>
                  <TableCell>{log.message}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
