import { Paper, Fade, Popper } from '@mui/material';
import Picker, { Theme, EmojiStyle } from 'emoji-picker-react';

const EmojiPopper = (props)=>{
  const {anchorEl, isOpenPopover, setOpenPopover, onEmojiClick} = props
  return (
    <Popper
      anchorEl={anchorEl}
      open={isOpenPopover}
      placement='top-start'
      onMouseEnter={(e)=>{setOpenPopover(true)}}
      onMouseLeave={(e)=>{setOpenPopover(false)}}
      sx={{zIndex: 1301}}
      transition
    >
      {
        ({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper>
              <Picker 
                onEmojiClick={onEmojiClick} 
                theme={Theme.DARK} 
                emojiStyle={EmojiStyle.NATIVE} 
                height={300}
                previewConfig={{
                  showPreview: false
                }}
              />
            </Paper>
          </Fade>
        )
      }
    </Popper>
  )
}
export default EmojiPopper;
