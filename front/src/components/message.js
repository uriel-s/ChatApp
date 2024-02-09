import React from 'react';

const Message = ({ senderName, username, text, view }) => {
  return (
    <div className="message">
      <p className="message-username">
        {senderName}: {text}{' '}
        {senderName === username && (view ? 'Is viewed? Yes' : 'Is viewed? No')}
      </p>
    </div>
  );
};

export default Message;