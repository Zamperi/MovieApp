import { useState } from 'react';
import { filterConfigByPage } from './filterConfig';
import {
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    FormGroup,
    Box,
    Typography,
    IconButton,
    Collapse,
} from '@mui/material';
import {
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

interface FilterCardProps {
    page: 'search' | 'movies' | 'groups';
    sortValue?: string;
    onSortChange?: (value: string) => void;
    filterValues?: Record<string, any>;
    onFiltersChange?: (filters: Record<string, any>) => void;
}

export default function FilterCard({
    page,
    sortValue,
    onSortChange,
    filterValues,
    onFiltersChange,
}: FilterCardProps) {
    const config = filterConfigByPage[page];

    const [openSort, setOpenSort] = useState(true);
    const [openFilter, setOpenFilter] = useState(false);

    const [internalSortValue, setInternalSortValue] = useState<string>(
        () => sortValue ?? config.sortOptions[0]?.value ?? ''
    );

    const effectiveSortValue = sortValue ?? internalSortValue;

    const handleSortChange = (value: string) => {
        if (onSortChange) {
            onSortChange(value);
        } else {
            setInternalSortValue(value);
        }
    };

    return (
        <>
            {/* Sort-osio */}
            <Paper
                elevation={2}
                sx={{
                    p: '1rem',
                    mb: '1rem',
                    borderRadius: '0.75rem',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: openSort ? '0.5rem' : 0,
                    }}
                >
                    <Typography variant="subtitle1" fontWeight={600}>
                        Sort
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={() => setOpenSort((prev) => !prev)}
                    >
                        {openSort ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>

                <Collapse in={openSort} timeout="auto" unmountOnExit>
                    <FormControl fullWidth size="small">
                        <InputLabel id="sort-label">Sort by</InputLabel>
                        <Select
                            labelId="sort-label"
                            label="Sort by"
                            value={effectiveSortValue}
                            onChange={(e) =>
                                handleSortChange(e.target.value as string)
                            }
                        >
                            {config.sortOptions.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Collapse>
            </Paper>

            {/* Filter-osio */}
            <Paper
                elevation={2}
                sx={{
                    p: '1rem',
                    borderRadius: '0.75rem',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: openFilter ? '0.5rem' : 0,
                    }}
                >
                    <Typography variant="subtitle1" fontWeight={600}>
                        Filters
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={() => setOpenFilter((prev) => !prev)}
                    >
                        {openFilter ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>

                <Collapse in={openFilter} timeout="auto" unmountOnExit>
                    {config.filterFields.map((field) => {
                        // Boolean-filtteri: yksi checkbox
                        if (field.type === 'boolean') {
                            const checked =
                                filterValues?.[field.key] ??
                                field.default ??
                                false;

                            return (
                                <Box key={field.key} sx={{ mb: '0.75rem' }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={checked}
                                                onChange={(e) =>
                                                    onFiltersChange?.({
                                                        ...(filterValues ?? {}),
                                                        [field.key]:
                                                            e.target.checked,
                                                    })
                                                }
                                                size="small"
                                            />
                                        }
                                        label={field.label}
                                    />
                                </Box>
                            );
                        }

                        // MultiSelect-filtteri: useita checkboxeja
                        if (field.type === 'multiSelect') {
                            const selected: number[] =
                                filterValues?.[field.key] ?? [];

                            return (
                                <Box key={field.key} sx={{ mb: '0.75rem' }}>
                                    <Typography
                                        variant="body2"
                                        sx={{ mb: '0.25rem' }}
                                    >
                                        {field.label}
                                    </Typography>
                                    <FormGroup row>
                                        {field.options.map((opt) => {
                                            const isChecked =
                                                selected.includes(opt.value);

                                            const handleToggle = (
                                                checked: boolean
                                            ) => {
                                                const next = checked
                                                    ? [...selected, opt.value]
                                                    : selected.filter(
                                                          (v) =>
                                                              v !== opt.value
                                                      );

                                                onFiltersChange?.({
                                                    ...(filterValues ?? {}),
                                                    [field.key]: next,
                                                });
                                            };

                                            return (
                                                <FormControlLabel
                                                    key={opt.value}
                                                    control={
                                                        <Checkbox
                                                            checked={isChecked}
                                                            onChange={(e) =>
                                                                handleToggle(
                                                                    e.target
                                                                        .checked
                                                                )
                                                            }
                                                            size="small"
                                                        />
                                                    }
                                                    label={opt.label}
                                                />
                                            );
                                        })}
                                    </FormGroup>
                                </Box>
                            );
                        }

                        // select / range -tyyppejä ei vielä renderöidä
                        return null;
                    })}
                </Collapse>
            </Paper>
        </>
    );
}
