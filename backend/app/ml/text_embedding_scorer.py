"""
================================================================================
IMPORTANT NOTE - SCORING METHODOLOGY
================================================================================

This code is NOT used dynamically in our main production system. This is one of 
several methods we employ specifically for scoring multiple-choice options in our 
scenarios during the development and validation phase.

Our complete scoring methodology includes:
1. Text Embedding Similarity (this script) - Semantic similarity to ideal answers
2. LLM-based Evaluation - Multiple LLMs (GPT-4, Claude, etc.) provide qualitative scores
3. Expert Human Review - Domain experts validate the scores
4. Statistical Analysis - Inter-rater reliability and consensus scoring

The final scores for each option are determined by combining all these methods,
not solely relying on embedding similarity. This multi-faceted approach ensures
more robust and accurate evaluation of analytical thinking patterns.

Use cases for this script:
- Initial automated scoring of new scenarios
- Consistency checking across similar questions
- Baseline establishment for option quality
- Training data generation for fine-tuned models

This is a SUPPLEMENTARY TOOL in our comprehensive evaluation pipeline.
================================================================================
"""

import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import openai
from typing import Dict, List, Tuple
import json

class ScenarioEvaluator:
    """
    Text Embedding-based Multiple Choice Question Evaluator
    
    This class evaluates multiple choice answers by comparing them to an ideal reference answer
    using semantic similarity through text embeddings. The system is designed to automatically
    score answers based on how closely they align with analytical thinking patterns.
    """
    
    def __init__(self, model_name='sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'):
        """
        Initialize the evaluator with a sentence transformer model.
        
        Args:
            model_name (str): Name of the pre-trained sentence transformer model to use.
                            Default is a multilingual model that supports Turkish.
        
        Available model options:
        - 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2': Fast, lightweight, supports 50+ languages
        - 'sentence-transformers/paraphrase-multilingual-mpnet-base-v2': More accurate, larger model
        - 'emrecan/bert-base-turkish-cased-mean-nli-stsb-tr': Turkish-specific BERT model
        - 'sentence-transformers/all-MiniLM-L6-v2': English-only, very fast
        
        The model converts text into dense vector representations (embeddings) that capture
        semantic meaning, allowing mathematical comparison of text similarity.
        """
        self.model = SentenceTransformer(model_name)
        self.openai_api_key = None  # Optional: Set if you want to use GPT for reference generation
        
    def generate_reference_text(self, scenario: str, use_gpt: bool = False, api_key: str = None) -> str:
        """
        Generate an ideal reference answer that represents high analytical thinking.
        
        This function creates the "gold standard" answer that all options will be compared against.
        It can either use a pre-written analytical response or generate one using GPT-4.
        
        Args:
            scenario (str): The scenario/question text to generate a reference answer for
            use_gpt (bool): Whether to use GPT-4 API to generate the reference (requires API key)
            api_key (str): OpenAI API key for GPT-4 access
        
        Returns:
            str: A comprehensive analytical reference answer that embodies:
                 - Data-driven decision making
                 - Systematic approach to problem solving
                 - Segmentation and targeting strategies
                 - Testing and optimization mindset
                 - Resource efficiency considerations
        """
        if use_gpt and api_key:
            # Use GPT-4 to generate a high-quality analytical reference answer
            openai.api_key = api_key
            
            prompt = f"""You are a highly analytical strategy expert with exceptional data-driven decision-making skills. 
            
            Scenario: {scenario}
            
            How would you approach this scenario? Create a detailed, analytical strategy.
            Focus on: data analysis, segmentation, pilot testing, measurement, and optimization.
            Respond in the same language as the scenario."""
            
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,  # Lower temperature for more consistent, analytical responses
                max_tokens=500
            )
            return response.choices[0].message['content']
        else:
            # Pre-written ideal analytical reference answer (in Turkish for this example)
            # This represents the thinking pattern of someone with high analytical skills
            return """
            Analitik yaklaşımla şu stratejiyi uygularım:
            
            1. Veri Analizi ve Segmentasyon: Öncelikle mevcut verileri detaylı analiz ederim. 
            Her yaş grubunun özelliklerini, dijital alışkanlıklarını ve çevre konularına yaklaşımlarını incelerim.
            
            2. Pilot Test Yaklaşımı: İlk 3 günde her segment için küçük ölçekli pilot testler yaparım. 
            Farklı içerik formatları ve mesajlaşma stratejilerini test ederek gerçek zamanlı veri toplarım.
            
            3. Kanal Optimizasyonu: 
            - 15-18 yaş için kısa, etkileyici video içerikler (TikTok, Instagram Reels)
            - 25-35 yaş için veri odaklı, bilgilendirici infografikler (LinkedIn, Twitter)  
            - 35+ yaş için geleneksel medya ve WhatsApp grupları kombinasyonu
            
            4. Bütçe Dağılımı: Pilot test sonuçlarına göre dinamik bütçe ayarlaması yaparım. 
            En yüksek ROI sağlayan segment ve kanallara kaynak aktarımı yaparım.
            
            5. A/B Testing: Sürekli A/B testlerle mesajları optimize ederim. 
            Her gün performans metriklerini analiz eder, stratejiyi güncellerim.
            
            6. Çapraz Segment Sinerji: Segmentler arası viral potansiyeli olan içerikler oluştururum.
            Örneğin gençlerin ürettiği içeriklerin büyüklere ulaşması için köprüler kurarım.
            
            7. Ölçümleme: Engagement rate, conversion rate, reach, viral coefficient gibi KPI'ları 
            günlük takip eder, veri odaklı kararlarla kampanyayı optimize ederim.
            """
    
    def create_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Convert text strings into numerical embedding vectors.
        
        This is the core of the semantic similarity system. Each text is transformed into
        a high-dimensional vector (typically 384 or 768 dimensions) where similar meanings
        result in vectors that are close together in vector space.
        
        Args:
            texts (List[str]): List of text strings to convert to embeddings
        
        Returns:
            np.ndarray: Matrix where each row is an embedding vector for the corresponding text
                       Shape: (num_texts, embedding_dimension)
        
        Technical details:
        - The model uses transformer architecture to understand context
        - Each word influences the representation of other words (attention mechanism)
        - The final embedding captures the overall semantic meaning of the entire text
        """
        embeddings = self.model.encode(texts)
        return embeddings
    
    def calculate_similarity_scores(self, reference_embedding: np.ndarray, 
                                   option_embeddings: np.ndarray) -> List[float]:
        """
        Calculate cosine similarity between reference and each option embedding.
        
        Cosine similarity measures the cosine of the angle between two vectors:
        - 1.0 = identical direction (maximum similarity)
        - 0.0 = orthogonal (no similarity)
        - -1.0 = opposite direction (maximum dissimilarity)
        
        For text embeddings, scores typically range from 0.2 to 0.9
        
        Args:
            reference_embedding (np.ndarray): The ideal answer's embedding vector
            option_embeddings (np.ndarray): Matrix of option embeddings to compare
        
        Returns:
            List[float]: Similarity scores for each option (0 to 1 scale)
        
        Mathematical formula:
        cosine_similarity(A, B) = dot_product(A, B) / (norm(A) * norm(B))
        """
        similarities = cosine_similarity([reference_embedding], option_embeddings)[0]
        return similarities.tolist()
    
    def evaluate_scenario(self, scenario: str, options: Dict[str, str], 
                         reference_text: str = None, use_gpt: bool = False, 
                         api_key: str = None) -> Dict:
        """
        Main evaluation pipeline - orchestrates the entire scoring process.
        
        This method:
        1. Generates or uses a reference answer
        2. Converts all texts to embeddings
        3. Calculates similarity scores
        4. Normalizes scores to 0-100 scale
        5. Ranks options by score
        
        Args:
            scenario (str): The question/scenario text
            options (Dict[str, str]): Dictionary mapping option labels (A, B, C, etc.) to answer texts
            reference_text (str, optional): Pre-defined reference answer (if not provided, will generate)
            use_gpt (bool): Whether to use GPT-4 for reference generation
            api_key (str, optional): OpenAI API key
        
        Returns:
            Dict: Comprehensive results including:
                  - 'reference_text': The ideal answer used for comparison
                  - 'scores': Detailed scoring for each option
                  - 'rankings': Options sorted by score (best to worst)
        
        Score normalization explanation:
        - Raw cosine similarities might range from 0.3 to 0.7
        - We normalize to 0-100 scale for better interpretability
        - The best option gets 100, worst gets 0, others scaled proportionally
        """
        # Step 1: Generate or use provided reference text
        if reference_text is None:
            reference_text = self.generate_reference_text(scenario, use_gpt, api_key)
        
        print("📊 Reference text generated - representing ideal analytical thinking")
        print("-" * 50)
        
        # Step 2: Create embeddings for reference and all options
        # We process all texts in one batch for efficiency
        all_texts = [reference_text] + list(options.values())
        embeddings = self.create_embeddings(all_texts)
        
        # Separate reference embedding from option embeddings
        reference_embedding = embeddings[0]
        option_embeddings = embeddings[1:]
        
        # Step 3: Calculate raw similarity scores
        similarity_scores = self.calculate_similarity_scores(reference_embedding, option_embeddings)
        
        # Step 4: Prepare results dictionary
        results = {
            'reference_text': reference_text,
            'scores': {},
            'rankings': []
        }
        
        # Step 5: Normalize scores to 0-100 scale for better interpretability
        # This makes it easier to understand relative differences
        min_score = min(similarity_scores)
        max_score = max(similarity_scores)
        
        for option_key, score in zip(options.keys(), similarity_scores):
            # Linear normalization: (value - min) / (max - min) * 100
            # If all scores are identical, set to 50
            normalized_score = ((score - min_score) / (max_score - min_score)) * 100 if max_score > min_score else 50
            
            results['scores'][option_key] = {
                'raw_score': float(score),  # Original cosine similarity (0-1)
                'normalized_score': float(normalized_score),  # Scaled to 0-100
                'text': options[option_key][:100] + '...'  # First 100 chars for preview
            }
        
        # Step 6: Create ranking (sorted by normalized score, descending)
        results['rankings'] = sorted(
            results['scores'].items(), 
            key=lambda x: x[1]['normalized_score'], 
            reverse=True
        )
        
        return results
    
    def print_results(self, results: Dict):
        """
        Display evaluation results in a visually appealing format.
        
        Creates a console output with:
        - Ranking table with visual progress bars
        - Detailed score breakdown
        - Easy-to-read formatting
        
        Args:
            results (Dict): Results dictionary from evaluate_scenario()
        
        Visual elements:
        - Progress bars: █ for filled, ░ for empty
        - Percentage scores for quick interpretation
        - Ranked list to identify best/worst options immediately
        """
        print("\n" + "="*60)
        print("📈 EVALUATION RESULTS")
        print("="*60)
        
        print("\n🏆 RANKING (Best to Worst):")
        print("-"*40)
        
        # Display each option with visual progress bar
        for rank, (option, scores) in enumerate(results['rankings'], 1):
            score = scores['normalized_score']
            
            # Create visual progress bar (20 characters wide)
            bar_length = int(score / 5)  # Each block represents 5%
            bar = "█" * bar_length + "░" * (20 - bar_length)
            
            # Print ranking with visual elements
            print(f"{rank}. Option {option}: {bar} {score:.1f}%")
            print(f"   Cosine Similarity: {scores['raw_score']:.4f}")
            print()
        
        print("\n📝 DETAILED SCORES:")
        print("-"*40)
        
        # Show detailed breakdown for each option
        for option, scores in results['scores'].items():
            print(f"Option {option}:")
            print(f"  - Raw Score (0-1 scale): {scores['raw_score']:.4f}")
            print(f"  - Normalized Score: {scores['normalized_score']:.2f}/100")
            print()

# ================================================================================
# USAGE EXAMPLE - Demonstrates how to use the ScenarioEvaluator
# ================================================================================

if __name__ == "__main__":
    
    # Define the scenario/question that needs to be evaluated
    # This is a complex decision-making scenario requiring analytical thinking
    scenario = """
    Bir sivil toplum kuruluşu, farklı yaş gruplarına çevre bilinci kazandırmayı amaçlayan bir kampanya başlatmak istiyor. 
    Sizden, kampanyanın etki düzeyini artırmak için bir strateji geliştirmeniz isteniyor. 
    Elinizde sınırlı bir bütçe ve yalnızca iki hafta süreniz var. Kurum size bazı verileri sunuyor:
    * 15-18 yaş arası bireyler sosyal medya üzerinden kolay erişiliyor ancak ilgileri dağınık.
    * 25-35 yaş grubu çevreye duyarlı ancak içeriklerin bilgi yoğunluğu onların ilgisini çekiyor.
    * 35 yaş üstü bireyler, çevre konularına daha duyarlı ancak dijital platformlara erişimleri sınırlı.
    """
    
    # Define the multiple choice options
    # Each represents a different approach to the problem
    options = {
        'A': """Yaş gruplarına göre segmentasyon yapar, her grup için farklı iletişim kanalları ve içerikler belirlerim. 
                Önceki kampanya verilerini analiz ederek en etkili kombinasyonları belirlerim ve bunları uygularım.""",
        # Expected: HIGH SCORE - Shows segmentation and data analysis
        
        'B': """Önce 25-35 yaş grubuna odaklanırım çünkü en dengeli grup bu. 
                Tüm kaynakları bu hedef kitleye ayırır, maksimum etkiyi bu gruptan almayı hedeflerim.""",
        # Expected: MEDIUM SCORE - Focused but not comprehensive
        
        'C': """Elde edilen verilerin hepsini doğrudan üst yönetime sunarım. 
                Onların deneyimiyle karar vermelerini isterim, ben uygulama kısmında yer alırım.""",
        # Expected: LOW SCORE - Avoids responsibility and analytical thinking
        
        'D': """Tüm gruplara tek tip içerik hazırlarım. Böylece zaman ve kaynak kaybı yaşamam. 
                Yaygın ve genel geçer mesajlarla kampanyayı yayarım.""",
        # Expected: LOW SCORE - Ignores segmentation and data
        
        'E': """Önce küçük bir pilot grup üzerinde farklı stratejiler denerim. 
                Elde ettiğim verilere göre hangi grubun hangi içerikle daha çok etkileşime geçtiğini ölçer 
                ve uygulamayı bu verilere göre ölçeklendiririm."""
        # Expected: HIGH SCORE - Data-driven, testing-oriented approach
    }
    
    # Initialize the evaluator with default multilingual model
    evaluator = ScenarioEvaluator()
    
    # Run the evaluation
    # Set use_gpt=True and provide api_key to use GPT-4 for reference generation
    results = evaluator.evaluate_scenario(
        scenario=scenario,
        options=options,
        use_gpt=False  # Set to True and add api_key="your-key" to use GPT-4
    )
    
    # Display results in console
    evaluator.print_results(results)
    
    # Optional: Save results to JSON file for further analysis
    # This creates a structured data file that can be used for:
    # - Tracking evaluation history
    # - Statistical analysis
    # - Integration with other systems
    with open('evaluation_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
        print("\n💾 Results saved to 'evaluation_results.json'")
    
    # Example of accessing specific scores programmatically
    print("\n" + "="*60)
    print("📊 PROGRAMMATIC ACCESS EXAMPLE:")
    print("-"*40)
    best_option = results['rankings'][0][0]
    best_score = results['rankings'][0][1]['normalized_score']
    print(f"Best option: {best_option} with score {best_score:.2f}%")
    
    worst_option = results['rankings'][-1][0]
    worst_score = results['rankings'][-1][1]['normalized_score']
    print(f"Worst option: {worst_option} with score {worst_score:.2f}%")
    
    # ================================================================================
    # ADDITIONAL NOTES ON SCORING METHODOLOGY
    # ================================================================================
    # Remember: These embedding-based scores are just ONE component of our evaluation.
    # In production, we combine these scores with:
    # 
    # 1. LLM Evaluations (30-40% weight):
    #    - GPT-4 analytical assessment
    #    - Claude reasoning evaluation  
    #    - Gemini logical consistency check
    #
    # 2. Human Expert Scores (30-40% weight):
    #    - Domain experts rate each option
    #    - Consensus meetings for edge cases
    #
    # 3. Embedding Similarity (20-30% weight):
    #    - This script's output
    #    - Cross-validated with multiple models
    #
    # Final Score = Weighted average of all methods
    # This ensures robust, multi-perspective evaluation of analytical thinking
    # ================================================================================