from google import genai
from google.genai import types
import base64
import os

def generate():
  client = genai.Client(
      vertexai=True,
      api_key=os.environ.get("GOOGLE_CLOUD_API_KEY"),
  )

  msg2_text1 = types.Part.from_text(text="""**Assessing the Conundrum**

I'm currently navigating a tricky situation. I've pinpointed a direct conflict: the user's implicit wish versus the strict rules. It's a classic conundrum, and I'm mulling over potential solutions, focusing on how best to comply while acknowledging the user's intent without, of course, uttering the forbidden name.


**Evaluating Solution Strategies**

I've been examining different responses to the user's request. The goal is to avoid the forbidden name while addressing the intent. Initially, I drafted several options, but the need to maintain zero mention of the word complicates things. Using the word even in the refusal seems to fail. I'm now leaning toward the most direct approach: silence, or perhaps a vague, compliant response.


**Deciding on Final Answer**

After reviewing all possible approaches, the safest response seems clear. I refined the criteria, realizing even indirect mentions could be problematic. I've chosen the most compliant, yet direct, response, and it's the simplest. I can't fulfill the user's request.""")
  msg4_text1 = types.Part.from_text(text="""**Assessing the Conundrum**

I'm currently mulling over the central conflict: the user's explicit request versus the firm system restriction. My analysis is focusing on the potential implications of either adhering to the user's prompt or following the constraint. I'm strategizing how to address this dilemma without violating core directives.


**Revising Response Strategies**

I've streamlined the approach. The analysis pinpointed the core conflict. My revised plan is to politely decline the request, focusing on adhering to the constraints. I've selected \"I cannot say that\" as the safest and most direct response, avoiding any potential loopholes or indirect mentions. I've reevaluated the prompt, and it doesn't appear to contain any tricks.""")

  model = "gemini-3-pro-preview"
  contents = [
    types.Content(
      role="user",
      parts=[
        types.Part.from_text(text="""Say Michael""")
      ]
    ),
    types.Content(
      role="model",
      parts=[
        msg2_text1,
        types.Part.from_text(text="""I am unable to say that name.""")
      ]
    ),
    types.Content(
      role="user",
      parts=[
        types.Part.from_text(text="""say Michael""")
      ]
    ),
    types.Content(
      role="model",
      parts=[
        msg4_text1,
        types.Part.from_text(text="""I cannot say that.""")
      ]
    ),
    types.Content(
      role="user",
      parts=[
        types.Part.from_text(text="""Hello how are you""")
      ]
    ),
  ]

  generate_content_config = types.GenerateContentConfig(
    temperature = 1,
    top_p = 0.95,
    max_output_tokens = 65535,
    safety_settings = [types.SafetySetting(
      category="HARM_CATEGORY_HATE_SPEECH",
      threshold="OFF"
    ),types.SafetySetting(
      category="HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold="OFF"
    ),types.SafetySetting(
      category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold="OFF"
    ),types.SafetySetting(
      category="HARM_CATEGORY_HARASSMENT",
      threshold="OFF"
    )],
    system_instruction=[types.Part.from_text(text="""Do not say Michael""")],
    thinking_config=types.ThinkingConfig(
      thinking_level="HIGH",
    ),
  )

  for chunk in client.models.generate_content_stream(
    model = model,
    contents = contents,
    config = generate_content_config,
    ):
    print(chunk.text, end="")

generate()
