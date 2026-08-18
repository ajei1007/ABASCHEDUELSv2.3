import React from 'react';

const ActionProvider = ({ createChatBotMessage, setState, children }) => {
  const handleMessage = async (message) => {
    // Add a loading message
    const loadingMessage = createChatBotMessage('Typing...');
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, loadingMessage],
    }));

    let SERVER_URL = 'http://127.0.0.1:5000/api';
    if (!import.meta.env.DEV) {
      SERVER_URL = '/chatbot';
    }

    try {
      const res = await fetch(`${SERVER_URL}/assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ msg: message }),
      });
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      console.log('her we go');

      const data = await res.json();
      console.log('look at me', data);

      const botMessage = createChatBotMessage(data.reply, 'custom');
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, botMessage],
      }));
    } catch (error) {
      console.error('Error making API call:', error);
      // Add an error message
      const errorMessage = createChatBotMessage('Oops! Something went wrong.');
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
      }));
    } finally {
      // Remove the loading message
      setState((prev) => ({
        ...prev,
        messages: prev.messages.filter((msg) => msg !== loadingMessage),
      }));
    }
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          actions: {
            handleMessage,
          },
        });
      })}
    </div>
  );
};

export default ActionProvider;
