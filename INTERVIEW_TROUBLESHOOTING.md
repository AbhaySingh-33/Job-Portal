# Interview Voice Feature - Troubleshooting Guide

## Common Issues and Solutions

### Issue: AI Not Listening or Responding

**Symptoms:**
- You can hear the initial greeting but AI doesn't respond to your answers
- Call ends immediately after starting
- Console shows "Meeting has ended" error

**Solutions:**

#### 1. Check Microphone Permissions
- **Chrome/Edge**: Click the lock icon in the address bar → Site settings → Microphone → Allow
- **Firefox**: Click the shield/lock icon → Permissions → Use Microphone → Allow
- The app will now show "✅ Microphone Ready" when permissions are granted

#### 2. Verify Vapi Configuration
Make sure your Vapi token is properly configured:
- Check `frontend/.env.local` has: `NEXT_PUBLIC_VAPI_WEB_TOKEN=your-token-here`
- Restart the Next.js dev server after changing env variables

#### 3. Check Vapi Account Status
- Visit [vapi.ai](https://vapi.ai) and check your account
- Ensure you have sufficient credits
- Verify your API key is active and not expired

#### 4. Test Your Microphone
- Go to browser settings and test your microphone
- Ensure no other app is using the microphone
- Try using headphones with a built-in mic

### Issue: Audio Quality Problems

**Solutions:**
- Reduce background noise
- Speak clearly and at normal volume
- Ensure you're 6-12 inches from the microphone
- Check internet connection (voice AI requires stable connection)

### Issue: Premature Call Ending

**Causes:**
- Silence timeout (default: 30 seconds)
- Maximum duration reached (30 minutes)
- Network interruption
- Vapi credit exhaustion

**Solutions:**
- Speak regularly to prevent timeout
- Check console logs for specific error messages
- Verify stable internet connection

## How Voice Interview Works

1. **Start Interview**: Click "Start Interview" button
2. **Initial Greeting**: AI introduces itself and asks first question
3. **Your Response**: Speak your answer clearly
4. **AI Processing**: AI listens, processes, and responds with follow-up
5. **Conversation Flow**: AI asks questions one at a time
6. **End Interview**: Click "End Call" or say "goodbye" when done

## Configuration Details

The interview uses:
- **Voice Provider**: OpenAI (Alloy voice)
- **Transcription**: Deepgram Nova-2
- **AI Model**: GPT-3.5-turbo
- **Max Duration**: 30 minutes
- **Silence Timeout**: 30 seconds

## Debug Mode

Check browser console (F12) for detailed logs:
- `🎤 Audio detected` - Your voice is being captured
- `👤 User Response` - Your speech was transcribed
- `🤖 AI Response` - AI's reply
- `✅ Call started successfully` - Interview session active

## Need More Help?

1. Check browser console for error messages
2. Verify all services are running:
   ```powershell
   # In Job Portal directory
   cd frontend
   npm run dev
   ```
3. Test with a simple question first
4. Contact support if issues persist

## Best Practices

1. **Environment**: Quiet room with minimal echo
2. **Equipment**: Good quality microphone or headset
3. **Speaking**: Clear, moderate pace, natural tone
4. **Pausing**: Wait 1-2 seconds after AI finishes before responding
5. **Interruption**: Let AI finish speaking before you start
