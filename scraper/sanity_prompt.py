

import os
import httpx
from typing import Optional, Dict, Any

import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')

SANITY_PROJECT_ID = os.getenv('SANITY_PROJECT_ID')
SANITY_DATASET = os.getenv('SANITY_DATASET')
SANITY_API_TOKEN = os.getenv('SANITY_API_TOKEN')
SANITY_API_VERSION = '2023-03-30'
SANITY_API_URL = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data"  # v2023-03-30
PROMPT_DOC_ID = 'promptConfigSingleton'

async def fetch_prompt_config():
    logging.info('Checking for promptConfigSingleton in Sanity...')
    doc = await get_prompt_config()
    logging.debug(f"Raw promptConfigSingleton doc from Sanity: {doc}")
    if doc is None:
        logging.warning('promptConfigSingleton not found.')
    else:
        logging.info('Found promptConfigSingleton in Sanity.')
        if 'prompt' in doc:
            logging.info(f"Prompt: {doc['prompt']}")
        else:
            logging.warning('Prompt field is missing.')
        if 'instructions' in doc:
            logging.info(f"Instructions: {doc['instructions']}")
        else:
            logging.warning('Instructions field is missing.')
    return doc
async def patch_prompt_config(data: Dict[str, Any]):
    url = f"{SANITY_API_URL}/mutate/{SANITY_DATASET}"
    headers = {"Authorization": f"Bearer {SANITY_API_TOKEN}", "Content-Type": "application/json"}
    payload = {
        "mutations": [
            {
                "patch": {
                    "id": PROMPT_DOC_ID,
                    "set": data
                }
            }
        ]
    }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                logging.info('Patched promptConfigSingleton in Sanity.')
            else:
                logging.error(f'Failed to patch promptConfigSingleton: HTTP {resp.status_code} - {resp.text}')
    except Exception as e:
        logging.error(f'Error patching promptConfigSingleton: {e}')

async def get_prompt_config() -> Optional[Dict[str, Any]]:
    url = f"{SANITY_API_URL}/doc/{SANITY_DATASET}/{PROMPT_DOC_ID}"
    headers = {"Authorization": f"Bearer {SANITY_API_TOKEN}"}
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                response_body = resp.json()
                logging.debug(f"Full Sanity API response: {response_body}")
                # API returns 'documents' (plural) as an array
                documents = response_body.get('documents', [])
                if documents and len(documents) > 0:
                    doc = documents[0]
                    logging.info('Fetched promptConfigSingleton from Sanity.')
                    return doc
                else:
                    logging.warning('No documents found in response.')
                    return None
            else:
                logging.warning(f'Failed to fetch promptConfigSingleton: HTTP {resp.status_code} - {resp.text}')
                return None
    except Exception as e:
        logging.error(f'Error connecting to Sanity: {e}')
        return None

async def create_prompt_config(data: Dict[str, Any]):
    url = f"{SANITY_API_URL}/mutate/{SANITY_DATASET}"
    headers = {"Authorization": f"Bearer {SANITY_API_TOKEN}", "Content-Type": "application/json"}
    payload = {
        "mutations": [
            {
                "createIfNotExists": {
                    "_id": PROMPT_DOC_ID,
                    "_type": "promptConfig",
                    **data
                }
            }
        ]
    }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                logging.info('Created promptConfigSingleton in Sanity.')
            else:
                logging.error(f'Failed to create promptConfigSingleton: HTTP {resp.status_code} - {resp.text}')
    except Exception as e:
        logging.error(f'Error creating promptConfigSingleton: {e}')

async def get_prompt_and_instructions() -> Dict[str, str]:
    DEFAULT_PROMPT = """You are a professional journalist. Based on the following article information, create a unique, self-explanatory news headline that tells the complete story.

Requirements:
1. Make it COMPLETELY SELF-EXPLANATORY - readers should understand the full story from just the title
2. Include WHO, WHAT, WHERE, and WHY/WHEN if relevant
3. Be specific with names, places, and numbers
4. Keep it under 150 characters but prioritize clarity over brevity
5. Use active voice and present tense
6. Sound professional and journalistic, not clickbait
7. Return ONLY the headline, nothing else"""
    
    doc = await fetch_prompt_config()
    if doc:
        # Use fetched prompt, or fallback to default if empty
        prompt = doc.get("prompt", "").strip() or DEFAULT_PROMPT
        instructions = doc.get("instructions", "").strip()
        return {
            "prompt": prompt,
            "instructions": instructions
        }
    else:
        return {"prompt": DEFAULT_PROMPT, "instructions": ""}
