import importlib.util
from pathlib import Path
import unittest
spec=importlib.util.spec_from_file_location('checker',Path(__file__).resolve().parents[1]/'scripts/check-resource-links.py')
checker=importlib.util.module_from_spec(spec);spec.loader.exec_module(checker)
class ContentChecks(unittest.TestCase):
    def test_empty_page_cannot_pass_because_it_has_a_title_or_footer(self):
        page='<html><head><title>Housing help</title><script>'+('irrelevant script '*100)+'</script></head><body><main></main><footer>'+('Agency navigation '*100)+'</footer></body></html>'
        self.assertEqual(checker.classify_page('Housing help',page)[0],'needs-review')
    def test_interactive_shell_is_disclosed_and_needs_an_explicit_exception(self):
        page='<html><head><title>Search</title></head><body><div id="app"></div></body></html>'
        self.assertEqual(checker.classify_page('Search',page)[0],'needs-review')
        self.assertEqual(checker.classify_page('Search',page,True)[0],'interactive-not-tested')
    def test_meaningful_content_passes_but_a_challenge_never_does(self):
        page='<main><h1>Housing help</h1><p>'+('Contact a participating housing counselor to discuss your housing options and ask about fees. '*5)+'</p></main>'
        self.assertEqual(checker.classify_page('Housing help',page)[0],'reachable')
        self.assertEqual(checker.classify_page('Access denied',page,True)[0],'needs-review')
if __name__=='__main__':unittest.main()
