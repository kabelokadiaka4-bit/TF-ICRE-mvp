import argparse
import logging
import json
from datetime import datetime
import apache_beam as beam
from apache_beam.options.pipeline_options import PipelineOptions

class ParseCsv(beam.DoFn):
    """Parses a CSV line into a dictionary."""
    def process(self, element):
        # Assume simple CSV: loan_id,customer_id,amount,currency,status
        # In production, use a proper CSV library
        try:
            parts = element.split(',')
            yield {
                'loan_id': parts[0],
                'customer_id': parts[1],
                'amount': float(parts[2]),
                'currency': parts[3],
                'status': parts[4],
                'ingestion_date': datetime.utcnow().isoformat()
            }
        except Exception as e:
            logging.error(f"Error parsing line: {element}, {e}")
            # In production, write to Dead Letter Queue (DLQ)

class ValidateLoan(beam.DoFn):
    """Validates loan data business rules."""
    def process(self, element):
        # Example rule: Amount must be positive
        if element['amount'] > 0:
            yield element
        else:
            logging.warning(f"Invalid loan amount dropped: {element}")

def run(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', dest='input', required=True,
                        help='Input file to process.')
    parser.add_argument('--output', dest='output', required=True,
                        help='Output file to write results to.')
    
    known_args, pipeline_args = parser.parse_known_args(argv)
    
    pipeline_options = PipelineOptions(pipeline_args)
    
    with beam.Pipeline(options=pipeline_options) as p:
        (
            p
            | 'ReadFromGCS' >> beam.io.ReadFromText(known_args.input, skip_header_lines=1)
            | 'ParseCSV' >> beam.ParDo(ParseCsv())
            | 'Validate' >> beam.ParDo(ValidateLoan())
            | 'ToJson' >> beam.Map(json.dumps)
            | 'WriteToGCS' >> beam.io.WriteToText(known_args.output, file_name_suffix='.jsonl')
        )

if __name__ == '__main__':
    logging.getLogger().setLevel(logging.INFO)
    run()
