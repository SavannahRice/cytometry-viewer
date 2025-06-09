import time
from dataclasses import dataclass, field
from django.http import JsonResponse
import pandas
from .models import Subject, Sample, Cell, Project, Scientist
from django.db import models
from collections import defaultdict

COL_SPEC = [
    'project',
    'subject',
    'condition',
    'age',
    'sex',
    'treatment',
    'response',
    'sample',
    'sample_type',
    'time_from_treatment_start',
    'b_cell',
    'cd4_t_cell',
    'cd8_t_cell',
    'nk_cell',
    'monocyte',
]


@dataclass
class FileData:
    '''
    Dataclass to hold the data for each row in the inputCSV file.
    This class is used to create instances of Project, Subject, Sample, and Cell,
    and prevents creation of duplicate entries in the database.
    '''

    project: str
    subject: str
    condition: str
    age: int
    sex: str
    treatment: str
    response: str
    sample: str
    sample_type: str
    time_from_treatment_start: int
    b_cell: int
    cd4_t_cell: int
    cd8_t_cell: int
    nk_cell: int
    monocyte: int
    scientist: Scientist

    created_project: Project | None = None
    created_subject: Subject | None = None
    created_samples: Sample | None = None
    created_cells: list[Cell] | None = None

    def _parse_response(self):
        '''
        Parse the response field to a boolean value.
        '''
        if isinstance(self.response, str):
            self.response = self.response.strip().lower()
            if self.response in ['yes', 'true', '1', 'y']:
                return True
            elif self.response in ['no', 'false', '0', 'n']:
                return False
        return None
    
    def _parse_time_from_treatment_start(self):
        '''
        Parse the time_from_treatment_start field to an integer.
        If the field is empty or not a valid integer, return None.
        '''
        try:
            return int(self.time_from_treatment_start)
        except (ValueError, TypeError):
            return None

    def create_project(self, projects):
        '''
        Create a Project instance based on the project name from the CSV file and user
        (currently statically defined as 'Bob Loblaw', in production this would be done
        using the logged in user).
        - If the project does not exist in the projects dict, create a new Project
        instance.
        - If it does exist, retrieve the existing Project instance and assign it
        to self.created_project.
        '''
        if self.project not in projects:
            project = Project(
                project_name=self.project,
                date=time.strftime('%Y-%m-%d'),
                user=self.scientist,
            )
            project.save()
            projects[self.project] = project
        else:
            project = projects[self.project]

        self.created_project = project
        return

    def create_subject(self, subjects):
        '''
        Create a Subject instance based on the data from the CSV file.
        - If the subject does not exist in the subjects dict, create a new Subject 
          instance.
        - If it does exist, retrieve the existing Subject instance and assign it 
          to self.created_subject.
        The 'response' is parsed to a boolean value, if applicable.
        '''
        if self.subject not in subjects:
            response = self._parse_response()
            # Create a new Subject instance
            subject = Subject(
                subject_name=self.subject,
                condition=self.condition,
                age=self.age,
                treatment=self.treatment,
                response=response,
                project=self.created_project,
            )

            subject.save()
            subjects[self.subject] = subject
        else:
            subject = subjects[self.subject]

        self.created_subject = subject
        return

    def create_sample_and_cells(self, samples):
        '''
        Per the CSV each sample (s1, s2, s3, etc.) is unique in the CSV.
        But, add to samples dict as a tuple of (subject,sample) to ensure uniqueness.

        - If the sample does not exist in the samples dict, create a new Sample instance.
        - Else If it does exist, retrieve the existing Sample instance and assign 
          it to self.created_sample.
        - Then create Cell instances for each cell type with the corresponding count.
        '''
        time_from_start = self._parse_time_from_treatment_start()

        if (self.subject, self.sample) not in samples:
            sample = Sample(
                sample_name=self.sample,
                sample_type=self.sample_type,
                time_from_treatment_start=time_from_start,
                subject=self.created_subject,
            )
            sample.save()
            samples[(self.subject, self.sample)] = sample
        else:
            sample = samples[(self.subject, self.sample)]

        self.created_sample = sample

        # Create cells for the sample
        cells = [
            Cell(type='b_cell', count=self.b_cell, sample=sample),
            Cell(type='cd4_t_cell', count=self.cd4_t_cell, sample=sample),
            Cell(type='cd8_t_cell', count=self.cd8_t_cell, sample=sample),
            Cell(type='nk_cell', count=self.nk_cell, sample=sample),
            Cell(type='monocyte', count=self.monocyte, sample=sample),
        ]
        created_cells = Cell.objects.bulk_create(cells)
        self.created_cells = created_cells

        return


def import_view(request):
    '''
    Handles the import of a CSV file containing data about projects, subjects, samples, and cells.
    - The CSV file should have the columns found in COL_SPEC.
    - The function reads the CSV file, creates instances of Project, Subject, Sample, and Cell,
    and returns a JSON response with the status of the import and the IDs of the created projects.
    '''
    if request.method == 'POST':

        # The frontend should prevent a submission without a file,
        # but we check here as well to avoid server errors.
        if 'file' not in request.FILES:
            return JsonResponse(
                {'status': 'error', 'message': 'No file uploaded'}, status=400
            )

        uploaded_file = request.FILES['file']

        # Again, the frontend should prevent a submission without a CSV file,
        # but we check here to avoid server errors.
        if not uploaded_file.name.lower().endswith('.csv'):
            return JsonResponse(
                {'status': 'error', 'message': 'Uploaded file is not a CSV'}, status=400
            )

        # Read the CSV file and retrieve the columns specified in COL_SPEC
        try:
            df = pandas.read_csv(uploaded_file)[COL_SPEC]
        except KeyError:
            return JsonResponse(
                {'status': 'error', 'message': 'CSV file is missing required columns'},
                status=400,
            )

        # Statically define the scientist for now.
        # In production, the logged in user would be used,
        # but user authentication has not been added to this app for demo purposes.
        scientist, _ = Scientist.objects.get_or_create(
            name='Bob Loblaw',
            email='b@company.com',
            company='Loblaw Bio',
        )

        projects = {}
        subjects = {}
        samples = {}

        # Create a list of FileData instances from the DataFrame
        # This will allow us to create the Project, Subject, Sample, and Cell instances
        data_class_list = [
            FileData(**row, scientist=scientist) for row in df.to_dict(orient='records')
        ]

        for dc in data_class_list:
            dc.create_project(projects)
            dc.create_subject(subjects)
            dc.create_sample_and_cells(samples)

        # Get the project IDs from the created projects,
        # this will be used to navigate to the project view after import.
        project_ids = [p.id for p in projects.values()]

        return JsonResponse(
            {'status': 'success', 'project_ids': project_ids}, status=200
        )
    else:
        return JsonResponse(
            {'status': 'error', 'message': 'Invalid request method'}, status=400
        )


def results_view(request):
    '''
    Returns a JSON response with all Projects that belong to a specific Scientis.
    '''
    try:
        scientist = Scientist.objects.get(name='Bob Loblaw')
        projects = Project.objects.filter(user=scientist)
        return JsonResponse(
            {
                'status': 'success',
                'projects': [
                    {
                        'id': project.id,
                        'project_name': project.project_name,
                        'date': project.date.strftime('%Y-%m-%d'),
                    }
                    for project in projects
                ],
            },
            status=200,
        )
    except Exception as e:
        return JsonResponse(
            {'status': 'error', 'message': str(e)}, status=500
        )
    
def results_view_with_id(request, project_id):
    '''
    Returns a JSON response with all Subjects, Samples, and Cells for a specific Project ID.
    '''
    try:
        project = Project.objects.get(id=project_id)
        subjects = subjects = Subject.objects.filter(project=project).prefetch_related(
            models.Prefetch(
                'sample_set',
                queryset=Sample.objects.prefetch_related('cell_set')
            )
        )
        subject_dict = {}
        samples_list = []

        for subject in subjects:
            subject_dict[subject.id] = {
                'subject_name': subject.subject_name,
                'condition': subject.condition,
                'age': subject.age,
            }

            for sample in subject.sample_set.all():
                cell_sum = sample.total_cell_count()
                for cell in sample.cell_set.all():
                    samples_list.append(
                        {
                            'id': cell.id,
                            'response': subject.response,
                            'subject_id': sample.subject.id,
                            'sample_id': sample.id,
                            'sample_name': sample.sample_name,
                            'sample_type': sample.sample_type,
                            'time_from_treatment_start': sample.time_from_treatment_start,
                            'total_count': cell_sum,
                            'population': cell.type,
                            'count': cell.count,
                            'relative_frequency': (
                                cell.count / cell_sum if cell_sum else None
                            ),

                        }
                    )


        return JsonResponse(
            {
                'status': 'success',
                'project_data': {
                    'project': {
                    'id': project.id,
                    'project_name': project.project_name,
                    'date': project.date.strftime('%Y-%m-%d'),
                },
                'subjects': subject_dict,
                'samples': samples_list,
                }
                }, status=200)
    
    except Exception as e:
        return JsonResponse(
            {'status': 'error', 'message': str(e)}, status=500
        )

@dataclass
class QueryData:
    '''
    Dataclass to hold the data for the query results.
    This class is used to filter and aggregate data based on the query parameters.
    '''

    project: str | None
    condition: str | None
    sex: str | None
    treatment: str | None
    sample_type: str | None
    age_operator: str | None
    age: int | None
    time_from_treatment_start: int | None
    time_operator: str | None
    scientist: Scientist

    project_query_params: dict = field(default_factory=dict)
    subject_query_params: dict = field(default_factory=dict)
    sample_query_params: dict = field(default_factory=dict)
    query_results: dict = field(default_factory=dict)
    query_stats: dict = field(default_factory=dict)

    def _build_project_query_params(self):
        '''
        Build the query parameters for filtering projects based on the provided attributes.
        '''
        self.project_query_params = {'user': self.scientist}
        if self.project:
            self.project_query_params['project_name'] = self.project
    
    def _build_subject_query_params(self):
        '''
        Build the query parameters for filtering subjects based on the provided attributes.
        '''
        
        if self.condition:
            self.subject_query_params['condition'] = self.condition
        if self.sex:
            self.subject_query_params['sex'] = self.sex
        if self.treatment:
            self.subject_query_params['treatment'] = self.treatment
        if self.age:
            if self.age_operator:
                if self.age_operator == 'gt':
                    self.subject_query_params['age__gt'] = self.age
                elif self.age_operator == 'lt':
                    self.subject_query_params['age__lt'] = self.age
                elif self.age_operator == 'eq':
                    self.subject_query_params['age'] = self.age
            else:
                self.subject_query_params['age'] = self.age

    def _build_sample_query_params(self):
        
        if self.time_from_treatment_start:
            if self.time_operator:
                if self.time_operator == 'gt':
                    self.sample_query_params['time_from_treatment_start__gt'] = self.time_from_treatment_start
                elif self.time_operator == 'lt':
                    self.sample_query_params['time_from_treatment_start__lt'] = self.time_from_treatment_start
                elif self.time_operator == 'eq':
                    self.sample_query_params['time_from_treatment_start'] = self.time_from_treatment_start
            else:
                self.sample_query_params['time_from_treatment_start'] = self.time_from_treatment_start
        if self.sample_type:
            self.sample_query_params['sample_type'] = self.sample_type


    def retrieve_query_results(self):
        '''
        Retrieve the query results based on the provided attributes.
        - Filter projects based on the project name.
        - Filter subjects based on the provided attributes.
        '''
        self._build_project_query_params()
        self._build_subject_query_params()
        self._build_sample_query_params()
        projects = Project.objects.filter(**self.project_query_params).prefetch_related(
            models.Prefetch(
            'subject_set',
            queryset=Subject.objects.filter(**self.subject_query_params).prefetch_related(
                models.Prefetch(
                'sample_set',
                queryset=Sample.objects.filter(**self.sample_query_params)
                )
            )
            )
        )
        self.query_results = {
            'projects': [
                {
                    'id': project.id,
                    'project_name': project.project_name,
                    'date': project.date.strftime('%Y-%m-%d'),
                }
                for project in projects
            ],
            'subjects': [
                {
                    'id': subject.id,
                    'subject_name': subject.subject_name,
                    'condition': subject.condition,
                    'age': subject.age,
                    'sex': subject.sex,
                    'treatment': subject.treatment,
                    'response': subject.response,
                    'project_id': subject.project_id,
                }
                for project in projects
                for subject in project.subject_set.all()
            ],
            'samples': [
                {
                    'id': sample.id,
                    'sample_name': sample.sample_name,
                    'sample_type': sample.sample_type,
                    'time_from_treatment_start': sample.time_from_treatment_start,
                    'subject_id': sample.subject_id,
                }
                for project in projects
                for subject in project.subject_set.all()
                for sample in subject.sample_set.all()
    ],
}
        
        self._analyze_query_results()
        return {'query_results': self.query_results, 'query_stats': self.query_stats}
    
    def _analyze_query_results(self):
        '''
        Analyze the query results to count the number of samples per project,
        based on these parameters:
        -   How many samples from each project
        -   How many subjects were responders/non-responders 
        -   How many subjects were males/females
        '''
        samples_per_project = defaultdict(int)
        responders = 0
        non_responders = 0
        males = 0
        females = 0

        for subject in self.query_results['subjects']:
            if subject['response'] is True:
                responders += 1
            elif subject['response'] is False:
                non_responders += 1
            if subject['sex'].lower().startswith('m'):
                males += 1
            elif subject['sex'].lower().startswith('f'):
                females += 1
            

        for project in self.query_results['projects']:
            samples_per_project[project['project_name']] += 1
        
        self.query_stats = {
            'responders': responders,
            'non_responders': non_responders,
            'males': males,
            'females': females,
            'samples_per_project': samples_per_project
        }


def query_results(request):
    if request.method == 'GET':
        scientist, _ = Scientist.objects.get_or_create(
                name='Bob Loblaw',
                email='b@company.com',
                company='Loblaw Bio',
        )
        
        query_data = QueryData(
            project = request.GET.get('project'),
            condition = request.GET.get('condition'),
            sex = request.GET.get('sex'),
            treatment = request.GET.get('treatment'),
            sample_type = request.GET.get('sample_type'),
            age_operator = request.GET.get('age_operator'),
            age = request.GET.get('age'),
            time_from_treatment_start = request.GET.get('time_from_treatment_start'),
            time_operator = request.GET.get('time_operator'),
            scientist=scientist
            )
        
        results = query_data.retrieve_query_results()

        return JsonResponse(
            {'results': results}, status=200
        )
            