import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaFilter, FaRegClock } from "react-icons/fa6";

interface FilterValues {
  pool: { min: string; max: string };
  liquidity: { min: string; max: string };
  fdv: { min: string; max: string };
  vol: { min: string; max: string };
  txn: { min: string; max: string; period: string };
  buy: { min: string; max: string; period: string };
  sell: { min: string; max: string; period: string };
  sortBy: string;
  isActive: boolean;
}

type FilterKey = keyof Omit<FilterValues, 'sortBy' | 'isActive'>;

interface FilterDialogProps {
  onApplyFilters: (filters: FilterValues) => void;
  currentPeriod: string;
}

export function FilterDialog({ onApplyFilters, currentPeriod }: FilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    pool: { min: '', max: '' },
    liquidity: { min: '', max: '' },
    fdv: { min: '', max: '' },
    vol: { min: '', max: '' },
    txn: { min: '', max: '', period: currentPeriod },
    buy: { min: '', max: '', period: currentPeriod },
    sell: { min: '', max: '', period: currentPeriod },
    sortBy: currentPeriod,
    isActive: false
  });

  useEffect(() => {
    if (!filters.isActive) {
      setFilters(prev => ({
        ...prev,
        sortBy: currentPeriod,
        txn: { ...prev.txn, period: currentPeriod },
        buy: { ...prev.buy, period: currentPeriod },
        sell: { ...prev.sell, period: currentPeriod }
      }));
    }
  }, [currentPeriod]);

  const handleNumberInput = (value: string, key: FilterKey, field: 'min' | 'max') => {
    const numberPattern = /^\d*\.?\d*$/;
    if (value === '' || numberPattern.test(value)) {
      setFilters(prev => {
        const updatedFilter = { ...prev[key] as { min: string; max: string; period?: string } };
        updatedFilter[field] = value;
        return {
          ...prev,
          [key]: updatedFilter,
          isActive: true
        };
      });
    }
  };

  type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

  const handleReset = () => {
    const resetFilters = {
      pool: { min: '', max: '' },
      liquidity: { min: '', max: '' },
      fdv: { min: '', max: '' },
      vol: { min: '', max: '' },
      txn: { min: '', max: '', period: currentPeriod },
      buy: { min: '', max: '', period: currentPeriod },
      sell: { min: '', max: '', period: currentPeriod },
      sortBy: currentPeriod,
      isActive: false
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  const handleClose = () => {
    setFilters(prev => ({
      ...prev,
      isActive: false
    }));
    onApplyFilters({
      ...filters,
      isActive: false
    });
  };

  const PeriodSelect = ({ value, onChange, className }: { value: string; onChange: (value: string) => void; className?: string }) => (
    <div className="flex items-center gap-2">
      <FaRegClock className="text-gray-400" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`w-[100px] ${className}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5m">5M</SelectItem>
          <SelectItem value="1h">1H</SelectItem>
          <SelectItem value="6h">6H</SelectItem>
          <SelectItem value="24h">24H</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 px-3 bg-black border-purple-400/20 hover:bg-purple-400/20">
          <FaFilter className="mr-2 h-3 w-3" />
          Filter {filters.isActive && <span className="ml-1 text-xs bg-purple-400/20 px-1.5 py-0.5 rounded-full">Active</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-w-[85%] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-sm sm:text-base">Filter Options</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Adjust the filter settings to refine your search results.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-3">
          {/* Time Period */}
          <div className="grid gap-1.5">
            <Label htmlFor="period" className="text-xs sm:text-sm">Time Period</Label>
            <PeriodSelect
              value={filters.sortBy}
              onChange={(value) => {
                setFilters(prev => ({
                  ...prev,
                  sortBy: value,
                  txn: { ...prev.txn, period: value },
                  buy: { ...prev.buy, period: value },
                  sell: { ...prev.sell, period: value },
                  isActive: true
                }));
              }}
              className="w-full text-xs sm:text-sm"
            />
          </div>

          {/* Pool Range */}
          <div className="grid gap-1.5">
            <Label className="text-xs sm:text-sm">Pool Range</Label>
            <div className="flex gap-1.5">
              <div className="w-1/2">
                <Input
                  type="text"
                  placeholder="Min"
                  value={filters.pool.min}
                  onChange={(e: InputChangeEvent) => handleNumberInput(e.target.value, 'pool', 'min')}
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm px-2"
                />
              </div>
              <div className="w-1/2">
                <Input
                  type="text"
                  placeholder="Max"
                  value={filters.pool.max}
                  onChange={(e: InputChangeEvent) => handleNumberInput(e.target.value, 'pool', 'max')}
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm px-2"
                />
              </div>
            </div>
          </div>

          {/* Liquidity Range */}
          <div className="grid gap-1.5">
            <Label className="text-xs sm:text-sm">Liquidity Range</Label>
            <div className="flex gap-1.5">
              <div className="w-1/2">
                <Input
                  type="text"
                  placeholder="Min"
                  value={filters.liquidity.min}
                  onChange={(e: InputChangeEvent) => handleNumberInput(e.target.value, 'liquidity', 'min')}
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm px-2"
                />
              </div>
              <div className="w-1/2">
                <Input
                  type="text"
                  placeholder="Max"
                  value={filters.liquidity.max}
                  onChange={(e: InputChangeEvent) => handleNumberInput(e.target.value, 'liquidity', 'max')}
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm px-2"
                />
              </div>
            </div>
          </div>

          {/* FDV Range */}
          <div className="grid gap-1.5">
            <Label className="text-xs sm:text-sm">FDV Range</Label>
            <div className="flex gap-1.5">
              <div className="w-1/2">
                <Input
                  type="text"
                  placeholder="Min"
                  value={filters.fdv.min}
                  onChange={(e: InputChangeEvent) => handleNumberInput(e.target.value, 'fdv', 'min')}
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm px-2"
                />
              </div>
              <div className="w-1/2">
                <Input
                  type="text"
                  placeholder="Max"
                  value={filters.fdv.max}
                  onChange={(e: InputChangeEvent) => handleNumberInput(e.target.value, 'fdv', 'max')}
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm px-2"
                />
              </div>
            </div>
          </div>

          {/* Volume Range */}
          <div className="grid gap-1.5">
            <Label className="text-xs sm:text-sm">Volume Range</Label>
            <div className="flex gap-1.5">
              <div className="w-1/2">
                <Input
                  type="text"
                  placeholder="Min"
                  value={filters.vol.min}
                  onChange={(e: InputChangeEvent) => handleNumberInput(e.target.value, 'vol', 'min')}
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm px-2"
                />
              </div>
              <div className="w-1/2">
                <Input
                  type="text"
                  placeholder="Max"
                  value={filters.vol.max}
                  onChange={(e: InputChangeEvent) => handleNumberInput(e.target.value, 'vol', 'max')}
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm px-2"
                />
              </div>
            </div>
          </div>

          {/* TXN Range */}
          <div className="grid gap-1.5">
            <Label className="text-xs sm:text-sm">Transaction Range</Label>
            <div className="flex gap-1.5">
              <div className="w-[37%]">
                <Input
                  type="text"
                  placeholder="Min"
                  value={filters.txn.min}
                  onChange={(e: InputChangeEvent) => handleNumberInput(e.target.value, 'txn', 'min')}
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm px-2"
                />
              </div>
              <div className="w-[37%]">
                <Input
                  type="text"
                  placeholder="Max"
                  value={filters.txn.max}
                  onChange={(e: InputChangeEvent) => handleNumberInput(e.target.value, 'txn', 'max')}
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm px-2"
                />
              </div>
              <div className="w-[26%]">
                <PeriodSelect
                  value={filters.txn.period}
                  onChange={(value) => setFilters(prev => ({ ...prev, txn: { ...prev.txn, period: value } }))}
                  className="w-full text-xs sm:text-sm h-8 sm:h-9"
                />
              </div>
            </div>
          </div>

          {/* Buy Range */}
          <div className="grid gap-1.5">
            <Label className="text-xs sm:text-sm">Buy Range</Label>
            <div className="flex gap-1.5">
              <div className="w-[37%]">
                <Input
                  type="text"
                  placeholder="Min"
                  value={filters.buy.min}
                  onChange={(e: InputChangeEvent) => handleNumberInput(e.target.value, 'buy', 'min')}
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm px-2"
                />
              </div>
              <div className="w-[37%]">
                <Input
                  type="text"
                  placeholder="Max"
                  value={filters.buy.max}
                  onChange={(e: InputChangeEvent) => handleNumberInput(e.target.value, 'buy', 'max')}
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm px-2"
                />
              </div>
              <div className="w-[26%]">
                <PeriodSelect
                  value={filters.buy.period}
                  onChange={(value) => setFilters(prev => ({ ...prev, buy: { ...prev.buy, period: value } }))}
                  className="w-full text-xs sm:text-sm h-8 sm:h-9"
                />
              </div>
            </div>
          </div>

          {/* Sell Range */}
          <div className="grid gap-1.5">
            <Label className="text-xs sm:text-sm">Sell Range</Label>
            <div className="flex gap-1.5">
              <div className="w-[37%]">
                <Input
                  type="text"
                  placeholder="Min"
                  value={filters.sell.min}
                  onChange={(e: InputChangeEvent) => handleNumberInput(e.target.value, 'sell', 'min')}
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm px-2"
                />
              </div>
              <div className="w-[37%]">
                <Input
                  type="text"
                  placeholder="Max"
                  value={filters.sell.max}
                  onChange={(e: InputChangeEvent) => handleNumberInput(e.target.value, 'sell', 'max')}
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm px-2"
                />
              </div>
              <div className="w-[26%]">
                <PeriodSelect
                  value={filters.sell.period}
                  onChange={(value) => setFilters(prev => ({ ...prev, sell: { ...prev.sell, period: value } }))}
                  className="w-full text-xs sm:text-sm h-8 sm:h-9"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row justify-between gap-1.5 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="h-8 sm:h-9 text-xs sm:text-sm px-2"
          >
            Reset
          </Button>
          <div className="flex gap-1.5">
            <DialogClose asChild>
              <Button 
                variant="outline" 
                onClick={handleClose} 
                className="h-8 sm:h-9 text-xs sm:text-sm px-2"
              >
                Cancel
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button 
                type="submit" 
                onClick={() => onApplyFilters(filters)} 
                className="h-8 sm:h-9 text-xs sm:text-sm px-2"
              >
                Apply
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}