import { Box } from '@mui/material';

const ChatMessengerActiveChannelMessageInput = () => {
  // const { message } = useMessageContext();
  // const {
  //   cooldownRemaining,
  //   handleSubmit,
  //   hideSendButton,
  //   setCooldownRemaining,
  // } = useMessageInputContext();

  // const {
  //   AttachmentPreviewList = DefaultAttachmentPreviewList,
  //   AttachmentSelector = message
  //     ? SimpleAttachmentSelector
  //     : DefaultAttachmentSelector,
  //   CooldownTimer = DefaultCooldownTimer,
  //   EmojiPicker,
  //   LinkPreviewList = DefaultLinkPreviewList,
  //   QuotedMessagePreview = DefaultQuotedMessagePreview,
  //   SendButton = DefaultSendButton,
  //   TextareaComposer = DefaultTextareaComposer,
  // } = useComponentContext();

  return (
    <Box
      // component={WithDragAndDropUpload}
      sx={{
        backgroundColor: '#f8f8f8!important',
        borderTop: '1px solid #ddd!important',
        boxShadow: '0px -1px 2px rgba(0, 0, 0, 0.05)!important',
        py: '0.5rem!important',
      }}
      className='str-chat__message-input'
    >
      {/* <LinkPreviewList />
      <QuotedMessagePreviewHeader /> */}

      <div className='str-chat__message-input-inner'>
        {/* <AttachmentSelector /> */}
        <Box
          className='str-chat__message-textarea-container'
          sx={{
            backgroundColor: '#fff!important',
          }}
        >
          {/* <QuotedMessagePreview />
          <AttachmentPreviewList /> */}
          <div className='str-chat__message-textarea-with-emoji-picker'>
            {/* <TextareaComposer />
            {EmojiPicker && <EmojiPicker />} */}
          </div>
        </Box>

        {/* {!hideSendButton && (
          <>
            {cooldownRemaining ? (
              <CooldownTimer
                cooldownInterval={cooldownRemaining}
                setCooldownRemaining={setCooldownRemaining}
              />
            ) : (
              <>
                <SendButton sendMessage={handleSubmit} />
              </>
            )}
          </>
        )} */}
      </div>
    </Box>
  );
};

export default ChatMessengerActiveChannelMessageInput;
