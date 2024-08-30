import * as React from 'react';
import { Box, Button, Collapse, Typography, List, ListItem, ListItemText } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function TaskBox() {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Example list of tasks
  const tasks = [
    'Complete the project documentation',
    'Review pull requests',
    'Prepare for the client meeting',
    'Refactor the authentication module',
  ];

  return (
    <Box sx={{ width: 300, overflow: 'auto' }}>
      {/* Header with Expand/Collapse Button */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="caption">Tasks</Typography>
        <Button
          onClick={handleExpandClick}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ minWidth: 'unset' }} // Makes the button more compact
        >
        </Button>
      </Box>

      {/* Task List (Collapsible) */}
      <Collapse in={expanded}>
        <List>
          {tasks.map((task, index) => (
            <ListItem key={index} disablePadding>
              <ListItemText
                primary={task}
                primaryTypographyProps={{
                  variant: 'caption', // You can choose other variants like 'h6', 'subtitle1', etc.
                  color: 'textPrimary', // Adjust the color if needed
                }}
              />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Box>
  );
}
