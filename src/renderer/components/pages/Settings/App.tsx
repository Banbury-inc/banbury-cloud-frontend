import React from 'react';
import { Button, Card, Grid, Stack, Typography, Box } from '@mui/material';

export default function App() {
    return (
        <>
            <Typography id="app" paddingBottom={2} variant="h4" gutterBottom>
                App
            </Typography>

            <Stack direction="column" spacing={3}>
                <Card variant='outlined' sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{ pr: 3 }}>
                                        <Typography variant="h6" gutterBottom>Current Version</Typography>
                                        <Typography color="textSecondary" variant="caption">Banbury 3.1.2</Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </Grid>
                    </Grid>
                </Card>

                <Card variant='outlined' sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{ pr: 3 }}>
                                        <Typography variant="h6" gutterBottom>Check for Updates</Typography>
                                        <Typography color="textSecondary" variant="caption">Check for updates to Banbury Cloud</Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{ mt: 2, fontSize: '12px', padding: '2px 8px', height: '24px', minWidth: 'unset' }}
                            >
                                Check
                            </Button>
                        </Grid>
                    </Grid>
                </Card>

                <Card variant='outlined' sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{ pr: 3 }}>
                                        <Typography variant="h6" gutterBottom>Help</Typography>
                                        <Typography color="textSecondary" variant="caption">Learn how to use Banbury Cloud</Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{ mt: 2, fontSize: '12px', padding: '2px 8px', height: '24px', minWidth: 'unset' }}
                            >
                                Open
                            </Button>
                        </Grid>
                    </Grid>
                </Card>
            </Stack>
        </>
    );
}
