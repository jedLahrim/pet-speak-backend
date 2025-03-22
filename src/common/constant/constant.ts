
export class Constant {
  static OPEN_AI_URL =
    'https://router.huggingface.co/fireworks-ai/inference/v1/chat/completions';
  static OPEN_AI_HEADERS = {
    'Content-Type': 'application/json',
    'Authorization': process.env.HUGGING_FACE_TOKEN,
  };

  static readonly usernames = ['pets','Pet','jiffpom', 'nala_cat', 'realgrumpycat', 
                               'realgrumpycat','itsdougthepug','marniethedog',
                               'tunameltsmyheart','venustwofacecat'];
  static readonly API_URL =
    'https://instagram-scraper-api2.p.rapidapi.com/v1/reels';
  static readonly headers = {
    'x-rapidapi-key': '6789eae184msh516c6842cc65df5p16bcffjsn62cda002e24c',
    'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com',
  };
}
