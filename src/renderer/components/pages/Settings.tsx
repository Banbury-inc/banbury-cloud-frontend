import React, { useEffect, useState, useRef } from 'react';
import os from 'os';
import Stack from '@mui/material/Stack';
import { Button, Divider, FormControlLabel, FormGroup, Slider, Switch, TextField, Typography, useMediaQuery } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { CardContent, Container, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import AccountMenuIcon from '../common/AccountMenuIcon';
import { useAuth } from '../../context/AuthContext';
import Card from '@mui/material/Card';
import TaskBoxButton from '../TaskBoxButton';










export default function Settings() {







  return (
    // <Box sx={{ width: '100%', pl: 4, pr: 4, mt: 0, pt: 5 }}>
    <Box sx={{ width: '100%', pt: 0 }}>

      <Card variant='outlined' sx={{ borderTop: 0, borderLeft: 0, borderBottom: 0 }}>
        <CardContent sx={{ paddingBottom: '2px !important', paddingTop: '46px' }}>
          <Stack spacing={2} direction="row" sx={{ flexWrap: 'nowrap' }}>
            <Grid container spacing={0} sx={{ display: 'flex', flexWrap: 'nowrap', pt: 0 }}>

            </Grid>
            <Grid container justifyContent='flex-end' alignItems='flex-end'>
              <Grid item>
              </Grid>
              <Grid item>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                  <Stack direction="row">
                    <TaskBoxButton />
                    <AccountMenuIcon />
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>
      <Stack direction="row" spacing={0} sx={{ width: '100%', height: 'calc(100vh - 76px)', overflow: 'hidden' }}>
        {/* Left panel: Device table */}
        <Card variant="outlined" sx={{ flexGrow: 1, height: '100%', width: '30%', overflow: 'hidden' }}>
          <CardContent sx={{ height: '100%', width: '100%', overflow: 'auto' }}>
          </CardContent>
        </Card>

        {/* Right panel: Device details */}
        <Card variant="outlined" sx={{ p: 2, height: '100%', width: '70%', overflow: 'auto' }}>
          <CardContent>
            <Typography paddingBottom={2} variant="h4" gutterBottom>
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
                          <Typography color="textSecondary" variant="caption">Banbury 3.1.2
                          </Typography>
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
                          <Typography color="textSecondary" variant="caption"> Check for updates to Banbury Cloud</Typography>
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
                          <Typography color="textSecondary" variant="caption"> Learn how to use Banbury Cloud</Typography>
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


              <Typography paddingBottom={2} variant="h4" gutterBottom>
                Cloud Sync
              </Typography>


              <Card variant='outlined' sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Stack spacing={2} sx={{ width: '100%' }}>
                          <Box sx={{ pr: 3, pb: 2 }}>
                            <Typography variant="h6" gutterBottom>Performance score weightings</Typography>
                            <Typography color="textSecondary" variant="caption">When predicting the performance score of each device,
                              it is important to consider how important each metric is to the overall score. This metric will allow you to adjust
                              the weightings of each metric.
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ flex: '1' }}>
                              <Typography variant="h6" gutterBottom>Predicted CPU Usage</Typography>
                              <Typography color="textSecondary" variant="caption">The weight of the predicted CPU usage metric</Typography>
                            </Box>
                            <Box sx={{ width: '120px' }}>
                              <TextField
                                size="small"
                                label="Weight"
                                value={10}
                                fullWidth
                              />
                            </Box>
                          </Stack>
                        </Stack>
                      </Box>
                      <Divider />
                      <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ flex: '1' }}>
                          <Typography variant="h6" gutterBottom>Predicted RAM Usage</Typography>
                          <Typography color="textSecondary" variant="caption">The weight of the predicted RAM usage metric</Typography>
                        </Box>
                        <Box sx={{ width: '120px' }}>
                          <TextField
                            size="small"
                            label="Weight"
                            value={10}
                            fullWidth
                          />
                        </Box>
                      </Stack>
                      <Divider />

                      <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ flex: '1' }}>
                          <Typography variant="h6" gutterBottom>Predicted GPU Usage</Typography>
                          <Typography color="textSecondary" variant="caption">The weight of the predicted GPU usage metric</Typography>
                        </Box>
                        <Box sx={{ width: '120px' }}>
                          <TextField
                            size="small"
                            label="Weight"
                            value={10}
                            fullWidth
                          />
                        </Box>
                      </Stack>

                      <Divider />
                      <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ flex: '1' }}>
                          <Typography variant="h6" gutterBottom>Predicted Download Speed</Typography>
                          <Typography color="textSecondary" variant="caption">The weight of the predicted download speed metric</Typography>
                        </Box>
                        <Box sx={{ width: '120px' }}>
                          <TextField
                            size="small"
                            label="Weight"
                            value={10}
                            fullWidth
                          />
                        </Box>
                      </Stack>

                      <Divider />
                      <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ flex: '1' }}>
                          <Typography variant="h6" gutterBottom>Predicted Upload Speed</Typography>
                          <Typography color="textSecondary" variant="caption">The weight of the predicted upload speed metric</Typography>
                        </Box>
                        <Box sx={{ width: '120px' }}>
                          <TextField
                            size="small"
                            label="Weight"
                            value={10}
                            fullWidth
                          />
                        </Box>
                      </Stack>


                    </Stack>
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 2, fontSize: '12px', padding: '2px 8px', height: '24px', minWidth: 'unset' }}
                    >
                      Save
                    </Button>
                  </Grid>
                </Grid>
              </Card>





            </Stack>

          </CardContent>

        </Card >

      </Stack >
    </Box >
  );
}
