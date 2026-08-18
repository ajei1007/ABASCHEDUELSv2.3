import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Popper,
  Paper,
  ClickAwayListener,
  ListItemButton,
} from '@mui/material';
import { styled } from '@mui/system';

// --- 1) Install react-window: npm install react-window
import {
  FixedSizeList as VirtualList,
  type ListChildComponentProps,
} from 'react-window';

const StyledListItem = styled(ListItemButton)(({ theme }) => ({
  textAlign: 'center',
  padding: '0.25rem .5rem',
  fontSize: '0.85rem',
  '&.highlighted': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.selected': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

function generateTimes(interval: number): string[] {
  const times: string[] = [];
  const totalMinutes = 24 * 60;
  for (let i = 0; i < totalMinutes; i += interval) {
    const hour24 = Math.floor(i / 60);
    const minute = i % 60;
    const isAM = hour24 < 12;
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;
    const hh = hour12.toString().padStart(2, '0');
    const mm = minute.toString().padStart(2, '0');
    const ampm = isAM ? 'AM' : 'PM';
    times.push(`${hh}:${mm} ${ampm}`);
  }
  return times;
}

function parseTimeString(
  timeStr: string,
): { hour24: number; minute: number } | null {
  const match = timeStr.match(/^(\d{2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = match[3];

  if (period === 'PM' && hour < 12) {
    hour += 12;
  }
  if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  return { hour24: hour, minute: minute };
}

function dateTo12HourTimeString(date: Date) {
  let hour = date.getHours();
  const minute = date.getMinutes();
  const isAM = hour < 12;
  if (hour === 0) hour = 12;
  if (hour > 12) hour -= 12;

  const hh = hour.toString().padStart(2, '0');
  const mm = minute.toString().padStart(2, '0');
  const ampm = isAM ? 'AM' : 'PM';
  return `${hh}:${mm} ${ampm}`;
}

interface CustomTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  interval?: number;
  min?: string;
  max?: string;
  dataQa?: string; // Optional data-qa attribute for testing
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value = '',
  onChange,
  interval = 30,
  min,
  max,
  dataQa,
}) => {
  const [originalDate, setOriginalDate] = useState<Date | null>(null);

  // inputValue: what the user currently sees/typed.
  const [inputValue, setInputValue] = useState('');
  // lastValidValue: the last confirmed selection in hh:mm AM/PM format
  const [lastValidValue, setLastValidValue] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<VirtualList>(null); // react-window list ref

  // Memoize the generated time list so we don't recreate on each render
  const fullTimes = useMemo(() => generateTimes(interval), [interval]);

  // Pre-parse min and max if provided
  const minDate = min ? new Date(min) : null;
  const maxDate = max ? new Date(max) : null;

  useEffect(() => {
    if (value) {
      const parsedDate = new Date(value);
      setOriginalDate(parsedDate);
      const formatted = dateTo12HourTimeString(parsedDate);
      setInputValue(formatted);
      setLastValidValue(formatted);
    }
  }, [value]);

  const open = Boolean(anchorEl) && isOpen && fullTimes.length > 0;
  const selectedIndex = fullTimes.indexOf(lastValidValue);

  // When the menu opens, highlight either the last valid selection or the first
  useEffect(() => {
    if (open) {
      if (selectedIndex !== -1) {
        setHighlightedIndex(selectedIndex);
      } else {
        setHighlightedIndex(0);
      }
    }
  }, [open, selectedIndex]);

  // Scroll the highlighted item into view using react-window's scrollToItem
  useEffect(() => {
    if (open && listRef.current && highlightedIndex >= 0) {
      listRef.current.scrollToItem(highlightedIndex, 'center');
    }
  }, [open, highlightedIndex]);

  const disabled = false;

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
      setIsOpen(true);
      // Select all text so typing overwrites the existing value
      setTimeout(() => {
        inputRef.current?.select();
      }, 0);
    }
  };

  function fuzzyParseTime(val: string): string | null {
    const lowerVal = val.trim().toLowerCase();

    // Check if AM/PM present
    const complexMatch = lowerVal.match(/(\d{1,2})(:(\d{1,2}))?\s*([ap][m])$/);
    if (complexMatch) {
      let hour = parseInt(complexMatch[1], 10);
      const minute = complexMatch[3] ? parseInt(complexMatch[3], 10) : 0;
      const period = complexMatch[4].toUpperCase();
      if (hour >= 1 && hour <= 12 && minute >= 0 && minute < 60) {
        const hh = hour.toString().padStart(2, '0');
        const mm = minute.toString().padStart(2, '0');
        return `${hh}:${mm} ${period}`;
      }
      return null;
    }

    // No AM/PM given, decide AM/PM based on hour
    const simpleMatch = lowerVal.match(/^(\d{1,2})(:(\d{1,2}))?$/);
    if (simpleMatch) {
      let hour = parseInt(simpleMatch[1], 10);
      const minute = simpleMatch[3] ? parseInt(simpleMatch[3], 10) : 0;
      if (hour >= 1 && hour <= 12 && minute >= 0 && minute < 60) {
        // If hour < 7, assume AM, else PM
        const assumedPeriod = hour < 7 ? 'AM' : 'PM';
        const hh = hour.toString().padStart(2, '0');
        const mm = minute.toString().padStart(2, '0');
        return `${hh}:${mm} ${assumedPeriod}`;
      }
    }

    return null;
  }

  const handleClickAway = (event: MouseEvent | TouchEvent) => {
    if (
      anchorEl &&
      event.target instanceof Element &&
      anchorEl.contains(event.target)
    ) {
      return;
    }
    setIsOpen(false);

    // On blur (click away), try to finalize selection
    finalizeSelection();
  };

  const finalizeSelection = () => {
    const fuzzyMatch = fuzzyParseTime(inputValue);
    if (fuzzyMatch && fullTimes.includes(fuzzyMatch)) {
      selectOption(fuzzyMatch);
    } else if (fullTimes.includes(inputValue)) {
      selectOption(inputValue);
    } else {
      // No valid selection, revert to last known good value
      setInputValue(lastValidValue);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    setInputValue(val);
    // Do not finalize selection on each keystroke; only highlight if possible
    const parsed = fuzzyParseTime(val);
    if (parsed && fullTimes.includes(parsed)) {
      const idx = fullTimes.indexOf(parsed);
      setHighlightedIndex(idx);
    } else if (fullTimes.includes(val)) {
      const idx = fullTimes.indexOf(val);
      setHighlightedIndex(idx);
    } else {
      setHighlightedIndex(-1);
    }
  };

  const selectOption = (option: string) => {
    if (!originalDate) return;
    const parsed = parseTimeString(option);
    if (!parsed) return;
    const newDate = new Date(originalDate.getTime());
    newDate.setHours(parsed.hour24, parsed.minute, 0, 0);

    // Check min
    if (minDate && newDate < minDate) {
      // Out of range, revert
      setInputValue(lastValidValue);
      setIsOpen(false);
      return;
    }
    // Check max
    if (maxDate && newDate > maxDate) {
      // Out of range, revert
      setInputValue(lastValidValue);
      setIsOpen(false);
      return;
    }

    // Finalize selection
    setOriginalDate(newDate);
    setInputValue(option);
    setLastValidValue(option);
    onChange?.(newDate.toString());
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) {
          setAnchorEl(inputRef.current);
          setIsOpen(true);
          return;
        }
        setHighlightedIndex((prev) => {
          const newIndex = prev < fullTimes.length - 1 ? prev + 1 : prev;
          return newIndex;
        });
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!open) {
          setAnchorEl(inputRef.current);
          setIsOpen(true);
          return;
        }
        setHighlightedIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : prev;
          return newIndex;
        });
        break;
      case 'Enter':
        event.preventDefault();
        // On Enter, finalize selection if possible
        if (
          open &&
          highlightedIndex >= 0 &&
          highlightedIndex < fullTimes.length
        ) {
          selectOption(fullTimes[highlightedIndex]);
        } else {
          finalizeSelection();
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  /**
   * 4) Use react-window's VirtualList to render time options efficiently.
   */
  const Row = ({ index, style }: ListChildComponentProps) => {
    const option = fullTimes[index];
    const isHighlighted = index === highlightedIndex;
    const isSelected = option === lastValidValue;
    return (
      <StyledListItem
        className={`${isHighlighted ? 'highlighted' : ''} ${isSelected ? 'selected' : ''}`}
        onClick={() => selectOption(option)}
        style={style}
      >
        {option}
      </StyledListItem>
    );
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div>
        <input
          className='form-control'
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          data-qa={dataQa}
        />
        <Popper
          open={open}
          anchorEl={anchorEl}
          placement='bottom-start'
          style={{ zIndex: 1300 }}
        >
          {fullTimes.length > 0 && (
            <Paper elevation={3}>
              <VirtualList
                ref={listRef}
                height={200} // Pixel height of the dropdown
                itemCount={fullTimes.length}
                itemSize={36} // Row height in pixels
                width={90}
              >
                {Row}
              </VirtualList>
            </Paper>
          )}
        </Popper>
      </div>
    </ClickAwayListener>
  );
};

export default CustomTimePicker;
