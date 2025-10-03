#!/usr/bin/env python3
"""
Shoplite RAG Chat Interface
Connects to deployed LLM API for Shoplite customer service queries
"""

import requests
import json
import sys
from typing import Optional, Dict, Any

class ShopliteChatClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.session_id = f"session_{hash(base_url) % 10000:04d}"
        self.conversation_log = []
    
    def test_connection(self) -> bool:
        """Test if the API server is reachable"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            return response.status_code == 200
        except requests.exceptions.RequestException:
            return False
    
    def send_message(self, message: str, use_rag: bool = True) -> Dict[str, Any]:
        """Send a message to the LLM API"""
        endpoint = "/chat" if use_rag else "/ping"
        
        payload = {
            "message": message,
            "session_id": self.session_id
        }
        
        try:
            print("Retrieving context..." if use_rag else "Processing...")
            response = requests.post(
                f"{self.base_url}{endpoint}",
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    "error": f"API error {response.status_code}",
                    "response": "Sorry, the service is temporarily unavailable."
                }
                
        except requests.exceptions.Timeout:
            return {
                "error": "Request timeout",
                "response": "The request took too long. Please try again."
            }
        except requests.exceptions.ConnectionError:
            return {
                "error": "Connection failed",
                "response": "Cannot connect to the AI service. Please check the URL and try again."
            }
    
    def format_response(self, api_response: Dict[str, Any]) -> str:
        """Format the API response for display"""
        if "error" in api_response:
            return f"Error: {api_response['error']}\n\n{api_response.get('response', '')}"
        
        response_text = api_response.get("response", "No response received")
        sources = api_response.get("sources", [])
        confidence = api_response.get("confidence", "Unknown")
        
        formatted = f"Answer: {response_text}\n\n"
        
        if sources:
            formatted += f"Sources: {', '.join(sources)}\n"
        
        formatted += f"Confidence: {confidence}\n"
        
        # Log the conversation
        self.conversation_log.append({
            "query": api_response.get("query", ""),
            "response": response_text,
            "sources": sources,
            "confidence": confidence
        })
        
        return formatted
    
    def save_conversation_log(self, filename: str = "shoplite_chat_log.json"):
        """Save the conversation history to a file"""
        with open(filename, 'w') as f:
            json.dump(self.conversation_log, f, indent=2)
        print(f"Conversation log saved to {filename}")

def main():
    # Configuration - using your actual ngrok URL
    DEFAULT_URL = "https://pseudomonocyclic-albina-unamatively.ngrok-free.dev"
    
    print("Shoplite AI Assistant Chat Interface")
    print("=" * 50)
    
    # Get API URL from user or use default
    base_url = input(f"Enter your LLM API URL [{DEFAULT_URL}]: ").strip()
    if not base_url:
        base_url = DEFAULT_URL
    
    client = ShopliteChatClient(base_url)
    
    # Test connection
    print("Testing connection to AI service...")
    if not client.test_connection():
        print("Cannot connect to the AI service. Please check:")
        print("   - Is the Colab notebook running?")
        print("   - Is the ngrok URL correct?")
        print("   - Is the Flask server started?")
        sys.exit(1)
    
    print("Connected successfully!")
    print("\nType your questions about Shoplite below")
    print("Type '/rag off' to disable RAG (direct LLM)")
    print("Type '/rag on' to enable RAG (context-aware)")
    print("Type '/save' to save conversation log")
    print("Type '/quit' or '/exit' to end session")
    print("=" * 50)
    
    use_rag = True
    
    while True:
        try:
            user_input = input("\nYou: ").strip()
            
            if user_input.lower() in ['/quit', '/exit', 'quit', 'exit']:
                break
            elif user_input.lower() == '/save':
                client.save_conversation_log()
                continue
            elif user_input.lower() == '/rag off':
                use_rag = False
                print("RAG disabled - using direct LLM mode")
                continue
            elif user_input.lower() == '/rag on':
                use_rag = True
                print("RAG enabled - using context-aware mode")
                continue
            elif not user_input:
                continue
            
            # Send message to API
            response = client.send_message(user_input, use_rag)
            
            # Display formatted response
            print(f"\nAssistant:")
            print(client.format_response(response))
            
        except KeyboardInterrupt:
            print("\nSession ended by user")
            break
        except Exception as e:
            print(f"Unexpected error: {e}")
    
    # Offer to save conversation log
    if client.conversation_log:
        save = input("\nSave conversation log? (y/n): ").lower()
        if save == 'y':
            client.save_conversation_log()

if __name__ == "__main__":
    main()