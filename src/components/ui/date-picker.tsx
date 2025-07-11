import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { cn } from '@/lib/utils';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  minDate?: Date;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Selecione uma data",
  disabled = false,
  className,
  id,
  minDate
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState(date || new Date());

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onDateChange?.(selectedDate);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange?.(undefined);
  };

  const handleMonthChange = (newMonth: Date) => {
    setMonth(newMonth);
  };

  const handleYearSelect = (year: string) => {
    const newDate = new Date(month);
    newDate.setFullYear(parseInt(year));
    setMonth(newDate);
  };

  const handleMonthSelect = (monthIndex: string) => {
    const newDate = new Date(month);
    newDate.setMonth(parseInt(monthIndex));
    setMonth(newDate);
  };

  // Gerar anos (1950 até 2050)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);
  
  // Meses
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-gray-800 border-gray-600 text-gray-100 hover:bg-gray-700 hover:border-purple-400 transition-all duration-200",
              !date && "text-gray-400"
            )}
            disabled={disabled}
            id={id}
          >
            <Calendar className="mr-2 h-4 w-4 text-purple-400" />
            {date ? (
              <span className="flex-1">{format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
            ) : (
              <span className="flex-1">{placeholder}</span>
            )}
            {date && (
              <X 
                className="ml-2 h-4 w-4 text-gray-400 hover:text-white transition-colors cursor-pointer" 
                onClick={handleClear}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 bg-gray-800 border-gray-600 shadow-2xl" 
          align="start"
        >
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
            {/* Controles de Navegação Ano/Mês */}
            <div className="flex items-center justify-between mb-4 gap-2">
              <Select value={month.getMonth().toString()} onValueChange={handleMonthSelect}>
                <SelectTrigger className="w-[130px] bg-gray-700 border-gray-600 text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {months.map((monthName, index) => (
                    <SelectItem key={index} value={index.toString()} className="text-gray-100 focus:bg-gray-700">
                      {monthName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={month.getFullYear().toString()} onValueChange={handleYearSelect}>
                <SelectTrigger className="w-[100px] bg-gray-700 border-gray-600 text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 max-h-[200px]">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()} className="text-gray-100 focus:bg-gray-700">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DayPicker
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              month={month}
              onMonthChange={handleMonthChange}
              locale={ptBR}
              disabled={minDate ? { before: minDate } : undefined}
              components={{
                IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
              }}
              className="enhanced-day-picker"
              classNames={{
                months: "flex",
                month: "m-0",
                caption: "hidden", // Ocultar caption padrão já que temos nossos selects
                table: "w-full border-collapse",
                head_row: "flex",
                head_cell: "w-9 h-9 text-center font-medium text-xs text-gray-400 m-0 p-0",
                row: "flex w-full mt-1",
                cell: "w-9 h-9 text-center text-sm p-0 relative",
                day: cn(
                  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all",
                  "h-9 w-9 p-0 font-normal text-gray-300 border border-transparent",
                  "hover:bg-purple-600 hover:text-white hover:shadow-lg hover:scale-105 hover:border-transparent",
                  "focus:bg-purple-600 focus:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                ),
                day_selected: "bg-purple-700 text-white font-bold border-2 border-purple-300 shadow-lg hover:bg-purple-600 hover:text-white focus:bg-purple-600 focus:text-white",
                day_today: "bg-gray-700 text-white font-semibold hover:bg-purple-600 hover:text-white",
                day_outside: "text-gray-600 opacity-50 hover:bg-gray-600 hover:text-gray-300",
                day_disabled: "text-gray-600 opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-600 hover:transform-none hover:shadow-none",
                nav: "hidden", // Ocultar navegação padrão
                nav_button: "hidden",
                nav_button_previous: "hidden",
                nav_button_next: "hidden"
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 